import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import AppText from './AppText';
import fonts from '@assets/Fonts';
import { fontSize, horizontalScale, verticalScale } from '@styles/mixins';
import Colors from '@styles/colors';

interface EmptyStateViewProps {
    title?: string;
    description?: string;
    image?: ImageSourcePropType;
}

const EmptyStateView: React.FC<EmptyStateViewProps> = ({
    title = 'No Details Found',
    description = 'Related data not found at the moment.',
    image = require('@assets/images/common/noData.png')
}) => {
    return (
        <View style={styles.container}>
            <Image
                source={image}
                style={styles.image}
                resizeMode="contain"
            />
            <AppText style={styles.title}>{title}</AppText>
            <AppText style={styles.description}>{description}</AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(30),
        backgroundColor: Colors.white,
    },
    image: {
        width: horizontalScale(200),
        height: horizontalScale(200),
        marginBottom: verticalScale(20),
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: fontSize(20),
        color: '#1E1B4B',
        marginBottom: verticalScale(10),
    },
    description: {
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: fontSize(20),
    },
});

export default EmptyStateView;
