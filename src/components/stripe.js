"use strict";

const Stripe = require("stripe");

class StripeProvider {
    init({ apiKey }) {
        this.stripe = new Stripe(apiKey);
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
}

module.exports = new StripeProvider();
