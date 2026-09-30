import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React from 'react';
import { View } from 'react-native';
import styles from '../styles';
import { InfoRow, Tag, DocumentField } from './CommonComponents';
import { formatDOBLocally } from '@utils/dateUtils';
import AppText from '@components/AppText';

interface ViewModeProps {
    s: any;
    profile: any;
    phoneNumber: string;
    email: string;
    dob: string;
    address: string;
    workCategory: string;
    hourlyRate: string;
    skills: string[];
    availability: string[];
    citizenshipStatus: string;
    workPermit: string;
    visaStatus: string;
    portfolioUrl: string;
    resumeDoc: any;
    licenseDoc: any;
    agreementDoc: any;
    certifications: any[];
    navigation: any;
}

const ViewMode: React.FC<ViewModeProps> = ({
    s,
    profile,
    phoneNumber,
    email,
    dob,
    address,
    workCategory,
    hourlyRate,
    skills,
    availability,
    citizenshipStatus,
    workPermit,
    visaStatus,
    portfolioUrl,
    resumeDoc,
    licenseDoc,
    agreementDoc,
    certifications,
    navigation,
}) => {
    return (
        <View style={styles.viewSection}>
            <AppText style={styles.sectionTitle}>{s.personalInfo}</AppText>
            {(profile?.profile?.identityVerification?.phoneNumber || profile?.user?.mobile || phoneNumber) ? (
                <InfoRow
                    label={s.phoneNumber}
                    value={`+1 ${profile?.profile?.identityVerification?.phoneNumber || profile?.user?.mobile || phoneNumber}`}
                    showVerify={true}
                />

            ) : null}
            <InfoRow label={s.emailAddress} value={profile?.user?.email || email} showVerify={true} />
            <InfoRow label={s.dob} value={profile?.profile?.identityVerification?.dateOfBirth ? formatDOBLocally(profile.profile.identityVerification.dateOfBirth) : dob} />
            <InfoRow label={s.resAddress} multiline={true} value={profile?.profile?.identityVerification?.address
                ? [
                    profile.profile.identityVerification.address.street,
                    profile.profile.identityVerification.address.residentialAddress,
                    profile.profile.identityVerification.address.city?.name || profile.profile.identityVerification.address.city,
                    profile.profile.identityVerification.address.province?.name || profile.profile.identityVerification.address.province,
                    profile.profile.identityVerification.address.country?.name || profile.profile.identityVerification.address.country,
                    profile.profile.identityVerification.address.postalCode
                ].filter(Boolean).join(', ')
                : (profile?.profile?.identityVerification?.residentialAddress || address)
            } />

            <AppText style={styles.sectionTitle}>{s.professionalInfo}</AppText>
            <AppText style={styles.subLabel}>{s.workCategory}</AppText>
            <View style={styles.tagsContainer}>
                <Tag label={profile?.profile?.professionalProfile?.workCategory?.name || (typeof profile?.profile?.professionalProfile?.workCategory === 'string' ? profile.profile.professionalProfile.workCategory : workCategory) || 'N/A'} index={0} />
            </View>

            <InfoRow label={s.hourlyRate} value={`${formatCurrency(profile?.profile?.professionalProfile?.hourlyRate || hourlyRate)}/hr`} />

            <AppText style={styles.subLabel}>{s.skills}</AppText>
            <View style={styles.tagsContainer}>
                {(profile?.profile?.professionalProfile?.skills || skills).map((skill: string, index: number) => (
                    <Tag key={index} label={skill} index={index} />
                ))}
            </View>

            <AppText style={styles.subLabel}>{s.availability}</AppText>
            <View style={styles.tagsContainer}>
                {(profile?.profile?.professionalProfile?.availabilityDays || availability).map((day: string, index: number) => (
                    <Tag key={index} label={day} index={index} />
                ))}
            </View>

            <AppText style={styles.sectionTitle}>{s.workEligibility}</AppText>
            <InfoRow label={s.citizenshipStatus} value={profile?.profile?.workerEligibility?.citizenshipStatus?.name || profile?.profile?.workerEligibility?.citizenshipStatus || citizenshipStatus} />
            <InfoRow label={s.workPermit} value={workPermit} />
            <InfoRow label={s.visaStatus} value={visaStatus} />
            {portfolioUrl ? <InfoRow label={s.portfolio} value={portfolioUrl} /> : null}

            {(resumeDoc?.documentUrl || resumeDoc?.uri ||
                licenseDoc?.documentUrl || licenseDoc?.uri ||
                agreementDoc?.documentUrl || agreementDoc?.uri) && (
                    <>
                        <AppText style={styles.sectionTitle}>{s.docsAndUploads}</AppText>
                        {(resumeDoc?.documentUrl || resumeDoc?.uri) && <DocumentField label={s.resume} doc={resumeDoc} navigation={navigation} />}
                        {(licenseDoc?.documentUrl || licenseDoc?.uri) && <DocumentField label={s.professionalLicense} doc={licenseDoc} navigation={navigation} />}
                        {(agreementDoc?.documentUrl || agreementDoc?.uri) && <DocumentField label={s.contractorAgreement} doc={agreementDoc} navigation={navigation} />}
                    </>
                )}
        </View>
    );
};

export default ViewMode;
