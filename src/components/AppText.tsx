import React from 'react';
import { Text, TextProps } from 'react-native';

const AppText: React.FC<TextProps> = (props) => {
    return (
        <Text
            allowFontScaling={false}
            {...props}
        />
    );
};

export default AppText;
