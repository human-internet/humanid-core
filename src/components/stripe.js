"use strict";

const Stripe = require("stripe");

class StripeProvider {
    init({ apiKey, webhookSecret }) {
        this.stripe = new Stripe(apiKey);
        this.webhookSecret = webhookSecret;
    }

    /**
     * Get a transaction (charge) by its transactionId (charge ID).
     * @param {string} transactionId - The Stripe charge ID for the transaction.
     * @returns {Promise<Object>} - Returns the transaction (charge) details.
     */
    async getTransactionById(transactionId) {
        try {
            // Retrieve the transaction (charge) by its ID
            const transaction = await this.stripe.paymentIntents.retrieve(transactionId);
            return transaction;
        } catch (error) {
            console.error(`Error retrieving transaction ${transactionId}:`, error);
            throw error; // Rethrow the error to handle it where this function is called
        }
    }

    /**
     * Validate webhook from stripe
     * @param {Request} request
     * @returns
     */
    validateEvent(request) {
        const sig = request.headers["stripe-signature"];

        try {
            const event = this.stripe.webhooks.constructEvent(request.body, sig, this.webhookSecret);
            return event;
        } catch (error) {
            console.error(`Stripe Webhook Error: ${error.message}`, error);
            throw error;
        }
    }
}

module.exports = new StripeProvider();
