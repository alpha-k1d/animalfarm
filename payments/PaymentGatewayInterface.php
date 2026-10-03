<?php
// payments/PaymentGatewayInterface.php - Payment Gateway Contract

interface PaymentGatewayInterface
{
    /**
     * Initialize payment request.
     * 
     * @param int $userId Customer User ID
     * @param float $amount Amount in GHS
     * @param string $reference Unique system reference
     * @return array Gateway initialization payload (redirect_url, instructions, etc.)
     */
    public function initialize(int $userId, float $amount, string $reference);

    /**
     * Verify payment status server-side.
     * 
     * @param string $reference Unique system reference
     * @return array ['success' => bool, 'paid' => bool, 'amount_ghs' => float, 'data' => array, 'error' => string|null]
     */
    public function verify(string $reference);

    /**
     * Get transaction status details.
     * 
     * @param string $reference
     * @return array
     */
    public function getStatus(string $reference);

    /**
     * Check if gateway is enabled in admin settings.
     * 
     * @return bool
     */
    public function isEnabled(): bool;
}
