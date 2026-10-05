import { SystemSettings, User } from '../types';

export const PAYSTACK_PUBLIC_KEY = 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb';

/**
 * Returns the active Paystack Public Key.
 * Precedence: explicit override -> Vite env var -> configured live key 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb'
 */
export function getActivePaystackPublicKey(settings?: Partial<SystemSettings>): string {
  if (settings?.paystackPublicKey && settings.paystackPublicKey.trim().startsWith('pk_')) {
    return settings.paystackPublicKey.trim();
  }
  const envKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().startsWith('pk_')) {
    return envKey.trim();
  }
  return PAYSTACK_PUBLIC_KEY;
}

/**
 * Generates an official statutory transaction reference for Animal Farm Ghana
 */
export function generatePaystackReference(purpose: 'DEP' | 'PKG' | 'SPON' = 'DEP'): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AFG-LIVE-${purpose}-${timestamp}-${randomSuffix}`;
}

/**
 * Dynamically loads the Paystack Inline JavaScript SDK if not already present.
 */
export function loadPaystackInlineScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as any).PaystackPop) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existingScript = document.getElementById('paystack-inline-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-sdk';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Paystack inline SDK could not be loaded directly from CDN. Utilizing fallback handler.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface PaystackTransactionConfig {
  user: User;
  amountInGHS: number;
  purpose?: 'Deposit' | 'Package Enrollment' | 'Farm Sponsorship';
  packageTitle?: string;
  unitCode?: string;
  customReference?: string;
  publicKey?: string;
  onSuccess: (reference: string, response?: any) => void;
  onCancel?: () => void;
  onError?: (errorMessage: string) => void;
}

/**
 * Initiates an official Paystack Ghana payment modal
 */
export async function launchPaystackPayment(config: PaystackTransactionConfig): Promise<void> {
  const {
    user,
    amountInGHS,
    purpose = 'Deposit',
    packageTitle,
    unitCode,
    customReference,
    publicKey = PAYSTACK_PUBLIC_KEY,
    onSuccess,
    onCancel,
    onError
  } = config;

  const keyToUse = publicKey || PAYSTACK_PUBLIC_KEY;
  const reference = customReference || generatePaystackReference(purpose === 'Deposit' ? 'DEP' : 'PKG');
  
  // Paystack amounts in GHS are calculated in Pesewas (1 GHS = 100 Pesewas)
  const amountInPesewas = Math.round(amountInGHS * 100);

  // Email format validation for Paystack
  let customerEmail = user.email && user.email.includes('@') 
    ? user.email.trim() 
    : `${user.phone.replace(/[^0-9]/g, '') || 'farmer'}@animalfarmgh.com`;

  try {
    const isLoaded = await loadPaystackInlineScript();
    const paystackPop = (window as any).PaystackPop;

    if (isLoaded && paystackPop && typeof paystackPop.setup === 'function') {
      const handler = paystackPop.setup({
        key: keyToUse,
        email: customerEmail,
        amount: amountInPesewas,
        currency: 'GHS',
        ref: reference,
        channels: ['mobile_money', 'card', 'bank', 'ussd', 'qr'],
        metadata: {
          custom_fields: [
            {
              display_name: "Farmer Name",
              variable_name: "farmer_name",
              value: user.fullName || "Ghana Farm Outgrower"
            },
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: user.phone
            },
            {
              display_name: "Membership Number",
              variable_name: "membership_number",
              value: user.membershipNumber || "AFG-OUTGROWER"
            },
            {
              display_name: "Transaction Purpose",
              variable_name: "purpose",
              value: packageTitle ? `${purpose}: ${packageTitle} (${unitCode || ''})` : purpose
            },
            {
              display_name: "Paystack Public Key",
              variable_name: "paystack_public_key",
              value: keyToUse
            }
          ]
        },
        callback: function (response: any) {
          const finalRef = response?.reference || response?.trans || reference;
          onSuccess(finalRef, response);
        },
        onClose: function () {
          if (onCancel) {
            onCancel();
          }
        }
      });

      handler.openIframe();
      return;
    }
  } catch (err: any) {
    console.error('Paystack popup initiation exception:', err);
  }

  // Fallback: If external script could not launch iframe overlay (e.g. sandbox restriction or offline)
  // we trigger the error handler or fallback
  if (onError) {
    onError('Direct Paystack iframe invocation unavailable in current browser sandbox.');
  }
}
