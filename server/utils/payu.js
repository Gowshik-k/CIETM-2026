const crypto = require('crypto');

/**
 * Generate PayU Hash for transaction initialization
 * @param {Object} data - Payment data (txnid, amount, productinfo, firstname, email)
 * @param {String} merchantKey - PayU Merchant Key
 * @param {String} salt - PayU Merchant Salt
 */
const generatePayUHash = (data, merchantKey, salt) => {
    const { txnid, amount, productinfo, firstname, email } = data;

    // Hash Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
    // We use empty values for udf1-udf5 and other unused fields
    const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

    return crypto.createHash('sha512').update(hashString).digest('hex');
};

/**
 * Verify PayU Hash for transaction response
 */
const verifyPayUHash = (data, salt) => {
    const {
        key, txnid, amount, productinfo, firstname, email,
        status, resphash, additionalCharges
    } = data;

    // Response Hash Formula: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    // Note: if additionalCharges is present, formula changes slightly

    let hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    if (additionalCharges) {
        hashString = `${additionalCharges}|${hashString}`;
    }

    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    return calculatedHash === resphash;
};

module.exports = {
    generatePayUHash,
    verifyPayUHash
};
