// src/utils/userUtils.ts - Utility for Outgrower Account Validation and Test Account Purging
import { User } from '../types';

export const isTestUserAccount = (u: any): boolean => {
  if (!u || typeof u !== 'object') return true;
  if (!u.id || u.id === 0 || u.id === 1 || u.id === 2 || u.id === 3) return true;
  if (typeof u.id === 'number' && ((u.id >= 100 && u.id <= 120) || u.id >= 900 && u.id <= 999)) return true;
  if (!u.phone || !u.fullName) return true;

  const lowerName = (u.fullName || '').toString().trim().toLowerCase();
  if (
    !lowerName ||
    lowerName === 'outgrower member' ||
    lowerName === 'guest outgrower' ||
    lowerName === 'outgrower' ||
    lowerName === 'farmer' ||
    lowerName === 'user' ||
    lowerName === 'admin' ||
    lowerName === 'member' ||
    lowerName === 'tester' ||
    lowerName === 'test user' ||
    lowerName === 'test account' ||
    lowerName === 'test outgrower' ||
    lowerName === 'test farmer' ||
    lowerName === 'outgrower test' ||
    lowerName === 'demo user' ||
    lowerName === 'dummy user' ||
    lowerName === 'sample user' ||
    lowerName === 'abena mansa osei' || 
    lowerName === 'kofi boateng addo' || 
    lowerName.includes('kwame mensah') ||
    lowerName.includes('kwadwo mensah') ||
    lowerName.includes('abena mansa') ||
    lowerName.includes('abena serwaa') ||
    lowerName.includes('kofi boateng') ||
    lowerName.includes('kojo badu') ||
    lowerName.includes('yaa asantewaa') ||
    lowerName.includes('test') || 
    lowerName.includes('demo') ||
    lowerName.includes('dummy') ||
    lowerName.includes('sample') ||
    lowerName.includes('mock') ||
    lowerName.includes('fake') ||
    lowerName.includes('temp') ||
    lowerName.includes('stub')
  ) {
    return true;
  }

  const lowerEmail = (u.email || '').toString().trim().toLowerCase();
  if (
    lowerEmail.includes('@farmgh.com') ||
    lowerEmail.includes('test@') ||
    lowerEmail.includes('demo@') ||
    lowerEmail.includes('dummy@') ||
    lowerEmail.includes('mock@') ||
    lowerEmail.includes('sample@') ||
    lowerEmail.includes('example.com') ||
    lowerEmail.includes('+test') ||
    lowerEmail.includes('test.')
  ) {
    return true;
  }

  const phone = (u.phone || '').toString().replace(/[\s-]/g, '');
  if (
    !phone || 
    phone.length < 9 ||
    phone === '0244123456' || 
    phone === '0207119283' || 
    phone === '0544991823' || 
    phone === '0241982341' ||
    phone === '0000000000' ||
    phone === '1234567890' ||
    phone.startsWith('000') ||
    /^0+$/.test(phone) ||
    /^(\d)\1{7,}$/.test(phone)
  ) {
    return true;
  }

  const membership = (u.membershipNumber || '').toString().toLowerCase();
  if (membership.includes('test') || membership.includes('demo') || membership.includes('mock')) {
    return true;
  }

  return false;
};

export const isTestActivity = (item: any): boolean => {
  if (!item || typeof item !== 'object') return true;
  if (
    !item.userId ||
    item.userId === 0 ||
    item.userId === 1 ||
    item.userId === 2 ||
    item.userId === 3 ||
    (typeof item.userId === 'number' && ((item.userId >= 100 && item.userId <= 120) || (item.userId >= 900 && item.userId <= 999)))
  ) {
    return true;
  }

  const name = (item.userName || item.name || item.accountName || item.senderName || '').toLowerCase().trim();
  if (
    name === 'outgrower member' ||
    name === 'guest outgrower' ||
    name === 'outgrower' ||
    name === 'farmer' ||
    name === 'user' ||
    name === 'test user' ||
    name === 'test outgrower' ||
    name === 'outgrower test' ||
    name.includes('kwame mensah') ||
    name.includes('kwadwo mensah') ||
    name.includes('abena mansa') ||
    name.includes('abena serwaa') ||
    name.includes('kofi boateng') ||
    name.includes('kojo badu') ||
    name.includes('yaa asantewaa') ||
    name.includes('test') ||
    name.includes('demo') ||
    name.includes('dummy') ||
    name.includes('sample') ||
    name.includes('mock') ||
    name.includes('fake')
  ) {
    return true;
  }

  const phone = (item.userPhone || item.phone || item.accountNumber || '').toString().replace(/[\s-]/g, '');
  if (
    !phone || 
    phone.length < 9 || 
    phone === '0244123456' || 
    phone === '0207119283' || 
    phone === '0544991823' || 
    phone === '0241982341' || 
    phone === '0000000000' ||
    phone === '1234567890' ||
    phone.startsWith('000') ||
    /^0+$/.test(phone) ||
    /^(\d)\1{7,}$/.test(phone)
  ) {
    return true;
  }

  const ref = (item.id || item.protocolCode || item.ticketRef || '').toString().toLowerCase();
  if (ref.includes('test') || ref.includes('mock') || ref.includes('sample')) {
    return true;
  }

  return false;
};
