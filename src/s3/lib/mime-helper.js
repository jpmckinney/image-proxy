'use strict';

/**
 * Helper functions to validate mime-types (content types)
 *
 * @constructor
 */
function MimeHelper() {}

/** @const {Object} */
MimeHelper.prototype.IMAGE_TYPES = {
    'image/jpg': '.jpg',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
};

/**
 * Checks if the passed content type is an image.
 *
 * @param contentType {String}
 * @returns {Boolean}
 */
MimeHelper.prototype.isValidImage = function (contentType) {
    return (typeof this.IMAGE_TYPES[contentType] === 'string');
};

/**
 * Gets the file extension to use for the content type.
 *
 * @param contentType {String}
 * @returns {String}
 * @throws Error
 */
MimeHelper.prototype.getImageExtension = function (contentType) {
    if (!this.isValidImage(contentType)) {
        throw new Error('Not a valid content type.');
    }

    return this.IMAGE_TYPES[contentType];
};

module.exports = exports = new MimeHelper();