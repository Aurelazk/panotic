import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SHADOWS } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';

const VerificationScreen = ({ navigation }: any) => {
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputs = useRef<any[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 4) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <Icon name="cellphone-check" size={60} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Code de vérification</Text>
          <Text style={styles.subtitle}>
            Nous venons d'envoyer un code de vérification à votre numéro. Veuillez le saisir ci-dessous.
          </Text>

          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <CustomButton
            title="Confirm"
            onPress={() => {}}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.resendText}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 55,
    borderRadius: 12,
    backgroundColor: 'rgba(123, 97, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default VerificationScreen;
