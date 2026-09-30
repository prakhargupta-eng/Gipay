import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { horizontalScale, verticalScale } from '@styles/mixins';
import SkeletonFrame from '@components/SkeletonFrame';

const DiscoverSkeleton = () => {
    return (
        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.container}
            scrollEnabled={false}
        >
            {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.left}>
                            <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} borderRadius={4} />
                            <SkeletonFrame width={horizontalScale(80)} height={verticalScale(14)} borderRadius={4} style={{ marginTop: 6 }} />
                        </View>
                        <SkeletonFrame width={horizontalScale(60)} height={verticalScale(24)} borderRadius={12} />
                    </View>
                    
                    <View style={styles.details}>
                        <View style={styles.row}>
                            <SkeletonFrame width={horizontalScale(150)} height={verticalScale(12)} borderRadius={4} />
                            <SkeletonFrame width={horizontalScale(100)} height={verticalScale(12)} borderRadius={4} style={{ marginLeft: 12 }} />
                        </View>
                        <View style={styles.row}>
                            <SkeletonFrame width={horizontalScale(200)} height={verticalScale(12)} borderRadius={4} />
                        </View>
                        <View style={styles.row}>
                            <SkeletonFrame width={horizontalScale(250)} height={verticalScale(12)} borderRadius={4} />
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: verticalScale(10),
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
    },
    left: {
        flex: 1,
    },
    details: {
        gap: verticalScale(8),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default DiscoverSkeleton;
