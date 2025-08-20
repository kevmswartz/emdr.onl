import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BLSSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: any;
  onUpdateSettings: (updates: any) => void;
}

export function BLSSettingsModal({
  visible,
  onClose,
  settings,
  onUpdateSettings,
}: BLSSettingsModalProps) {
  if (!settings) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Speed Control */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingTitle}>Speed: {settings.speed.toFixed(1)} Hz</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.adjustButton}
                onPress={() => onUpdateSettings({ speed: Math.max(0.2, settings.speed - 0.1) })}
              >
                <Text style={styles.adjustButtonText}>- Slower</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.adjustButton}
                onPress={() => onUpdateSettings({ speed: Math.min(2.0, settings.speed + 0.1) })}
              >
                <Text style={styles.adjustButtonText}>Faster +</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shape Control */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingTitle}>Shape: {settings.shape}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.shapeOption, settings.shape === 'circle' && styles.shapeSelected]}
                onPress={() => onUpdateSettings({ shape: 'circle' })}
              >
                <View style={[styles.shapePreview, { borderRadius: 10, backgroundColor: settings.visual.shapeColor }]} />
                <Text style={styles.shapeLabel}>Circle</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.shapeOption, settings.shape === 'triangle' && styles.shapeSelected]}
                onPress={() => onUpdateSettings({ shape: 'triangle' })}
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
                onPress={() => onUpdateSettings({ shape: 'square' })}
              >
                <View style={[styles.shapePreview, { borderRadius: 2, backgroundColor: settings.visual.shapeColor }]} />
                <Text style={styles.shapeLabel}>Square</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Background Color Control */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingTitle}>Background Color</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#000000' }, settings.visual.backgroundColor === '#000000' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, backgroundColor: '#000000' } })}
              />
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#1e293b' }, settings.visual.backgroundColor === '#1e293b' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, backgroundColor: '#1e293b' } })}
              />
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#065f46' }, settings.visual.backgroundColor === '#065f46' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, backgroundColor: '#065f46' } })}
              />
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#1e40af' }, settings.visual.backgroundColor === '#1e40af' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, backgroundColor: '#1e40af' } })}
              />
            </View>
          </View>

          {/* Shape Color Control */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingTitle}>Shape Color</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#ffffff' }, settings.visual.shapeColor === '#ffffff' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, shapeColor: '#ffffff' } })}
              />
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#ef4444' }, settings.visual.shapeColor === '#ef4444' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, shapeColor: '#ef4444' } })}
              />
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#22c55e' }, settings.visual.shapeColor === '#22c55e' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, shapeColor: '#22c55e' } })}
              />
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#3b82f6' }, settings.visual.shapeColor === '#3b82f6' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, shapeColor: '#3b82f6' } })}
              />
              <TouchableOpacity 
                style={[styles.colorOption, { backgroundColor: '#f59e0b' }, settings.visual.shapeColor === '#f59e0b' && styles.colorSelected]}
                onPress={() => onUpdateSettings({ visual: { ...settings.visual, shapeColor: '#f59e0b' } })}
              />
            </View>
          </View>

          {/* Audio Settings */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingTitle}>Audio Settings</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.adjustButton, { backgroundColor: settings.audio.enabled ? '#22c55e' : '#374151' }]}
                onPress={() => onUpdateSettings({ audio: { ...settings.audio, enabled: !settings.audio.enabled } })}
              >
                <Text style={styles.adjustButtonText}>
                  {settings.audio.enabled ? 'Audio ON' : 'Audio OFF'}
                </Text>
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
                onPress={() => onUpdateSettings({ autoSlow: !settings.autoSlow })}
              >
                <Text style={styles.adjustButtonText}>
                  {settings.autoSlow ? 'Auto-Slow ON' : 'Auto-Slow OFF'}
                </Text>
              </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
  settingDescription: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
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
});