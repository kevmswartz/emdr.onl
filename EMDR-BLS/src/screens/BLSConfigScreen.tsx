import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BilateralStimulation } from '../components/BilateralStimulation';
import { useBLSSettings } from '../hooks/useSettings';
import { audioManager } from '../components/AudioManager';

interface BLSConfigScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function BLSConfigScreen({ visible, onClose }: BLSConfigScreenProps) {
  const { settings, updateSettings } = useBLSSettings();

  if (!settings) return null;

  const handleTestAudio = async () => {
    audioManager.updateSettings({
      enabled: settings.audio.enabled,
      volume: settings.audio.volume,
      leftFreq: settings.audio.leftFreq,
      rightFreq: settings.audio.rightFreq,
    });
    await audioManager.testAudio();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BLS Configuration</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Scrollable Content */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Preview Area */}
          <View style={styles.previewArea}>
            <BilateralStimulation
              isActive={false}
              speed={settings.speed}
              shape={settings.shape}
              size="medium"
              backgroundColor={settings.visual.backgroundColor}
              shapeColor={settings.visual.shapeColor}
              autoSlow={settings.autoSlow}
              autoSlowAmount={settings.autoSlowAmount}
              duration={settings.duration}
              audioSettings={settings.audio}
            />
            <View style={styles.previewTextOverlay}>
              <Text style={styles.previewText}>Preview</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Speed Control */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Speed: {settings.speed.toFixed(1)} Hz</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => updateSettings({ speed: Math.max(0.2, settings.speed - 0.1) })}
                >
                  <Text style={styles.adjustButtonText}>- Slower</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => updateSettings({ speed: Math.min(2.0, settings.speed + 0.1) })}
                >
                  <Text style={styles.adjustButtonText}>Faster +</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration Control */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Duration: {settings.duration} minutes</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => updateSettings({ duration: Math.max(1, settings.duration - 5) })}
                >
                  <Text style={styles.adjustButtonText}>-5 min</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => updateSettings({ duration: Math.min(60, settings.duration + 5) })}
                >
                  <Text style={styles.adjustButtonText}>+5 min</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Shape Control */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Shape: {settings.shape}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.shapeOption, settings.shape === 'circle' && styles.shapeSelected]}
                  onPress={() => updateSettings({ shape: 'circle' })}
                >
                  <View style={[styles.shapePreview, { borderRadius: 10, backgroundColor: settings.visual.shapeColor }]} />
                  <Text style={styles.shapeLabel}>Circle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.shapeOption, settings.shape === 'triangle' && styles.shapeSelected]}
                  onPress={() => updateSettings({ shape: 'triangle' })}
                >
                  <View style={styles.trianglePreview}>
                    <View style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 8,
                      borderRightWidth: 8,
                      borderBottomWidth: 14,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderBottomColor: settings.visual.shapeColor,
                    }} />
                  </View>
                  <Text style={styles.shapeLabel}>Triangle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.shapeOption, settings.shape === 'square' && styles.shapeSelected]}
                  onPress={() => updateSettings({ shape: 'square' })}
                >
                  <View style={[styles.shapePreview, { borderRadius: 2, backgroundColor: settings.visual.shapeColor }]} />
                  <Text style={styles.shapeLabel}>Square</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Size Control */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Size: {settings.size}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.sizeOption, settings.size === 'small' && styles.sizeSelected]}
                  onPress={() => updateSettings({ size: 'small' })}
                >
                  <Text style={styles.sizeLabel}>Small</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sizeOption, settings.size === 'medium' && styles.sizeSelected]}
                  onPress={() => updateSettings({ size: 'medium' })}
                >
                  <Text style={styles.sizeLabel}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sizeOption, settings.size === 'large' && styles.sizeSelected]}
                  onPress={() => updateSettings({ size: 'large' })}
                >
                  <Text style={styles.sizeLabel}>Large</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Background Color Control */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Background Color</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#000000' }, settings.visual.backgroundColor === '#000000' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, backgroundColor: '#000000' } })}
                />
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#1e293b' }, settings.visual.backgroundColor === '#1e293b' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, backgroundColor: '#1e293b' } })}
                />
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#065f46' }, settings.visual.backgroundColor === '#065f46' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, backgroundColor: '#065f46' } })}
                />
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#1e40af' }, settings.visual.backgroundColor === '#1e40af' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, backgroundColor: '#1e40af' } })}
                />
              </View>
            </View>

            {/* Shape Color Control */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Shape Color</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#ffffff' }, settings.visual.shapeColor === '#ffffff' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, shapeColor: '#ffffff' } })}
                />
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#ef4444' }, settings.visual.shapeColor === '#ef4444' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, shapeColor: '#ef4444' } })}
                />
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#22c55e' }, settings.visual.shapeColor === '#22c55e' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, shapeColor: '#22c55e' } })}
                />
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#3b82f6' }, settings.visual.shapeColor === '#3b82f6' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, shapeColor: '#3b82f6' } })}
                />
                <TouchableOpacity 
                  style={[styles.colorOption, { backgroundColor: '#f59e0b' }, settings.visual.shapeColor === '#f59e0b' && styles.colorSelected]}
                  onPress={() => updateSettings({ visual: { ...settings.visual, shapeColor: '#f59e0b' } })}
                />
              </View>
            </View>

            {/* Audio Settings */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Audio Settings</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.adjustButton, { backgroundColor: settings.audio.enabled ? '#22c55e' : '#374151' }]}
                  onPress={() => updateSettings({ audio: { ...settings.audio, enabled: !settings.audio.enabled } })}
                >
                  <Text style={styles.adjustButtonText}>
                    {settings.audio.enabled ? 'Audio ON' : 'Audio OFF'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={handleTestAudio}
                >
                  <Text style={styles.adjustButtonText}>🔊 Test Audio</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Auto-Slow Settings */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Auto-Slow</Text>
              <Text style={styles.settingDescription}>
                {settings.autoSlow 
                  ? `Gradually reduces speed by ${settings.autoSlowAmount}% over session duration`
                  : 'Disabled - speed remains constant during session'
                }
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.adjustButton, { backgroundColor: settings.autoSlow ? '#22c55e' : '#374151' }]}
                  onPress={() => updateSettings({ autoSlow: !settings.autoSlow })}
                >
                  <Text style={styles.adjustButtonText}>
                    {settings.autoSlow ? 'Auto-Slow ON' : 'Auto-Slow OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
              {settings.autoSlow && (
                <View style={styles.sliderSection}>
                  <Text style={styles.sliderTitle}>Reduction Amount: {settings.autoSlowAmount}%</Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.adjustButton}
                      onPress={() => updateSettings({ autoSlowAmount: Math.max(5, settings.autoSlowAmount - 5) })}
                    >
                      <Text style={styles.adjustButtonText}>-5%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.adjustButton}
                      onPress={() => updateSettings({ autoSlowAmount: Math.min(50, settings.autoSlowAmount + 5) })}
                    >
                      <Text style={styles.adjustButtonText}>+5%</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 44,
  },
  scrollContainer: {
    flex: 1,
  },
  previewArea: {
    height: 200,
    margin: 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  previewText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  controls: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  adjustButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  adjustButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shapeOption: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  shapeSelected: {
    backgroundColor: '#2563eb',
  },
  shapePreview: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
  },
  trianglePreview: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  sizeOption: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sizeSelected: {
    backgroundColor: '#2563eb',
  },
  sizeLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  colorOption: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#ffffff',
  },
  settingDescription: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  sliderSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#4b5563',
  },
  sliderTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
});