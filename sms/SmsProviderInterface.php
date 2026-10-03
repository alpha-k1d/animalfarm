<?php
// sms/SmsProviderInterface.php - Interface for SMS Gateways

interface SmsProviderInterface
{
    /**
     * Send an SMS message to a phone number.
     * 
     * @param string $phone Destination phone number (e.g. 0244123456 or 233244123456)
     * @param string $message Text content of the SMS
     * @return array ['success' => bool, 'message_id' => string|null, 'error' => string|null, 'simulated' => bool]
     */
    public function sendSms(string $phone, string $message): array;
}
