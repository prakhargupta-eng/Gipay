import { ImageSourcePropType } from 'react-native';

/**
 * Returns the appropriate icon based on the file extension of the URL.
 * @param url The file URL or path
 * @returns ImageSourcePropType for the icon
 */
export const getFileIcon = (url: string | null | undefined): ImageSourcePropType => {
    if (!url) return require('@assets/images/common/pdf.png');

    // Remove query parameters if present
    const cleanUrl = url.split('?')[0];
    const extension = cleanUrl.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return require('@assets/images/common/pdf.png');
        case 'doc':
        case 'docx':
            return require('@assets/images/common/doc.png');
        case 'png':
        case 'jpg':
        case 'jpeg':
            return require('@assets/images/common/png.png');
        default:
            return require('@assets/images/common/doc.png');
    }
};
