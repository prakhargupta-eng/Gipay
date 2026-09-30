import React from 'react';
import { View, ScrollView } from 'react-native';
import styles from '../styles';
import colors from '@styles/colors';

const MatchesDetailsSkeleton = () => {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header Skeleton */}
            <View style={styles.headerInfo}>
                <View style={[styles.companyLogo, { borderWidth: 2, borderColor:  '#E0E0E0'  }]}>
                    <View style={[styles.logoImage, { backgroundColor: '#E0E0E0' }]} />
                </View>
                <View style={styles.headerTextContent}>
                    <View style={[styles.skeletonBox, { width: 120, height: 24, marginBottom: 4 }]} />
                    <View style={[styles.skeletonBox, { width: 150, height: 16 }]} />
                </View>
                <View style={styles.headerRightContent}>
                    <View style={[styles.skeletonBox, { width: 60, height: 24, borderRadius: 12 }]} />
                    <View style={[styles.skeletonBox, { width: 40, height: 16, marginTop: 12 }]} />
                </View>
            </View>

            {/* Details Skeleton */}
            <View style={styles.detailsGrid}>
                <View style={[styles.detailItem, { backgroundColor: 'transparent' }]}>
                    <View style={[styles.skeletonBox, { width: '80%', height: 20 }]} />
                </View>
                <View style={[styles.detailItem, { backgroundColor: 'transparent' }]}>
                    <View style={[styles.skeletonBox, { width: '90%', height: 20 }]} />
                </View>
                <View style={styles.dateTimeRow}>
                    <View style={[styles.detailItem, { marginBottom: 0, marginRight: 15, flex: 1, backgroundColor: 'transparent' }]}>
                        <View style={[styles.skeletonBox, { width: '100%', height: 20 }]} />
                    </View>
                    <View style={[styles.detailItem, { marginBottom: 0, flex: 1, backgroundColor: 'transparent' }]}>
                        <View style={[styles.skeletonBox, { width: '100%', height: 20 }]} />
                    </View>
                </View>
            </View>

            <View style={[styles.skeletonBox, { width: 100, height: 20, marginBottom: 10 }]} />
            <View style={[styles.descriptionBox, styles.skeletonBox, { height: 80, backgroundColor: '#E0E0E0' }]} />

            <View style={[styles.skeletonBox, { width: 150, height: 20, marginBottom: 10, marginTop: 20 }]} />
            <View style={[styles.certificationBox, styles.skeletonBox, { height: 100, backgroundColor: '#E0E0E0' }]} />
            
            <View style={[styles.contractorRow, { marginTop: 20 }]}>
                <View style={[styles.skeletonBox, { width: 150, height: 20 }]} />
                <View style={[styles.skeletonBox, { width: 40, height: 40, borderRadius: 8 }]} />
            </View>
        </ScrollView>
    );
};

export default MatchesDetailsSkeleton;
