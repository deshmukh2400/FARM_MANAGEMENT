import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { speak, isSpeakingAsync, stop } from 'expo-speech';

// Voice Guidance Component
export const VoiceGuidance = ({ 
  text, 
  autoPlay = false, 
  language = 'en',
  showButton = true,
  onSpeechStart,
  onSpeechEnd 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (autoPlay && text) {
      speakText(text);
    }
  }, [text, autoPlay]);

  const speakText = async (textToSpeak) => {
    try {
      const speaking = await isSpeakingAsync();
      if (speaking) {
        await stop();
      }

      setIsSpeaking(true);
      onSpeechStart?.();

      const options = {
        language: language,
        pitch: 1.0,
        rate: 0.8, // Slower speech for better comprehension
        quality: 'enhanced',
        onStart: () => setIsSpeaking(true),
        onDone: () => {
          setIsSpeaking(false);
          onSpeechEnd?.();
        },
        onStopped: () => {
          setIsSpeaking(false);
          onSpeechEnd?.();
        },
        onError: () => {
          setIsSpeaking(false);
          setIsAvailable(false);
          Alert.alert('Voice Error', 'Voice guidance is not available on this device.');
        }
      };

      await speak(textToSpeak, options);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      setIsAvailable(false);
    }
  };

  const stopSpeech = async () => {
    try {
      await stop();
      setIsSpeaking(false);
      onSpeechEnd?.();
    } catch (error) {
      console.error('Stop speech error:', error);
    }
  };

  if (!isAvailable || !showButton) return null;

  return (
    <TouchableOpacity
      style={[styles.voiceButton, isSpeaking && styles.voiceButtonActive]}
      onPress={isSpeaking ? stopSpeech : () => speakText(text)}
      accessibilityLabel={isSpeaking ? "Stop voice guidance" : "Play voice guidance"}
    >
      <Icon 
        name={isSpeaking ? "volume-off" : "volume-up"} 
        size={20} 
        color={isSpeaking ? "#FF3B30" : "#4A90E2"} 
      />
      <Text style={[styles.voiceButtonText, isSpeaking && styles.voiceButtonTextActive]}>
        {isSpeaking ? "Stop" : "🔊 Listen"}
      </Text>
    </TouchableOpacity>
  );
};

// Screen Reader Component for entire screens
export const ScreenReader = ({ 
  children, 
  screenTitle, 
  instructions,
  language = 'en' 
}) => {
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);

  useEffect(() => {
    // Auto-play screen introduction for new users or accessibility mode
    if (!hasPlayedIntro && screenTitle) {
      const introText = `${screenTitle}. ${instructions || 'Use the buttons below to navigate.'}`;
      setTimeout(() => {
        speakIntroduction(introText);
        setHasPlayedIntro(true);
      }, 500);
    }
  }, [screenTitle, instructions]);

  const speakIntroduction = async (text) => {
    try {
      await speak(text, {
        language: language,
        pitch: 1.0,
        rate: 0.7,
        quality: 'enhanced'
      });
    } catch (error) {
      console.error('Screen reader error:', error);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* Screen title with voice guidance */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{screenTitle}</Text>
        <VoiceGuidance 
          text={`${screenTitle}. ${instructions}`}
          language={language}
          showButton={true}
        />
      </View>
      
      {instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>{instructions}</Text>
        </View>
      )}
      
      {children}
    </View>
  );
};

// Voice-Guided Form Field
export const VoiceFormField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  instructions,
  language = 'en',
  required = false,
  ...props 
}) => {
  const fieldDescription = `${label}${required ? ', required field' : ''}. ${instructions || ''}`;
  
  return (
    <View style={styles.formFieldContainer}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>
          {label} {required && <Text style={styles.requiredMark}>*</Text>}
        </Text>
        <VoiceGuidance 
          text={fieldDescription}
          language={language}
          showButton={true}
        />
      </View>
      
      {instructions && (
        <Text style={styles.fieldInstructions}>{instructions}</Text>
      )}
      
      <TextInput
        style={styles.voiceFormInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        accessibilityLabel={fieldDescription}
        {...props}
      />
    </View>
  );
};

// Multi-language Support Component
export const LanguageSelector = ({ 
  currentLanguage, 
  onLanguageChange,
  availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]
}) => {
  const [showLanguages, setShowLanguages] = useState(false);

  const selectLanguage = (langCode) => {
    onLanguageChange(langCode);
    setShowLanguages(false);
    
    // Announce language change
    const selectedLang = availableLanguages.find(lang => lang.code === langCode);
    speak(`Language changed to ${selectedLang?.name}`, { language: langCode });
  };

  return (
    <View style={styles.languageContainer}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowLanguages(!showLanguages)}
      >
        <Icon name="language" size={20} color="#4A90E2" />
        <Text style={styles.languageButtonText}>
          {availableLanguages.find(lang => lang.code === currentLanguage)?.flag} Language
        </Text>
        <Icon 
          name={showLanguages ? "expand-less" : "expand-more"} 
          size={20} 
          color="#4A90E2" 
        />
      </TouchableOpacity>

      {showLanguages && (
        <View style={styles.languageDropdown}>
          {availableLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                currentLanguage === language.code && styles.selectedLanguage
              ]}
              onPress={() => selectLanguage(language.code)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <Text style={styles.languageName}>{language.name}</Text>
              {currentLanguage === language.code && (
                <Icon name="check" size={20} color="#4A90E2" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Accessibility Helper Component
export const AccessibilityHelper = ({ onToggleVoice, voiceEnabled = true }) => {
  const [showHelp, setShowHelp] = useState(false);

  const helpText = `
    This app helps you manage your farm. 
    Tap any button with a speaker icon to hear instructions. 
    Use the language button to change the language. 
    If you need help, tap the help button or call our support team.
  `;

  return (
    <View style={styles.accessibilityContainer}>
      <View style={styles.accessibilityButtons}>
        <TouchableOpacity
          style={styles.accessibilityButton}
          onPress={() => setShowHelp(!showHelp)}
        >
          <Icon name="help" size={20} color="#4A90E2" />
          <Text style={styles.accessibilityButtonText}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accessibilityButton}
          onPress={onToggleVoice}
        >
          <Icon 
            name={voiceEnabled ? "volume-up" : "volume-off"} 
            size={20} 
            color={voiceEnabled ? "#4A90E2" : "#A0AEC0"} 
          />
          <Text style={styles.accessibilityButtonText}>
            {voiceEnabled ? "Voice On" : "Voice Off"}
          </Text>
        </TouchableOpacity>
      </View>

      {showHelp && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>{helpText}</Text>
          <VoiceGuidance 
            text={helpText}
            autoPlay={true}
            showButton={false}
          />
          <TouchableOpacity
            style={styles.closeHelpButton}
            onPress={() => setShowHelp(false)}
          >
            <Text style={styles.closeHelpText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  voiceButtonActive: {
    backgroundColor: '#FED7D7',
    borderColor: '#FF3B30',
  },
  voiceButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 4,
  },
  voiceButtonTextActive: {
    color: '#FF3B30',
  },

  screenContainer: {
    flex: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  instructions: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },

  formFieldContainer: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  requiredMark: {
    color: '#FF3B30',
  },
  fieldInstructions: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
    lineHeight: 16,
  },
  voiceFormInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    minHeight: 50,
  },

  languageContainer: {
    position: 'relative',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  languageDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  selectedLanguage: {
    backgroundColor: '#EBF8FF',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
  },

  accessibilityContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  accessibilityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  accessibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accessibilityButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    marginLeft: 4,
  },
  helpContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpText: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
    marginBottom: 12,
  },
  closeHelpButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeHelpText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default {
  VoiceGuidance,
  ScreenReader,
  VoiceFormField,
  LanguageSelector,
  AccessibilityHelper,
}; 