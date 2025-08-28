import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Button,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg'; // Import SVG components

const router = useRouter();

export default function MainApp() {
  const [generation, setGeneration] = useState('');
  const [prevmonthExport, setprevmonthExport] = useState('');
  const [exportUnits, setExportUnits] = useState('');
  const [prevmonthimport, setprevmonthImport] = useState('');
  const [importUnits, setImportUnits] = useState('');
  const [tariff, setTariff] = useState('');
  const [results, setResults] = useState(null);
  const [showTariffInput, setShowTariffInput] = useState(false);
  const [theme, setTheme] = useState(null); // State for manual theme toggle
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const isSystemDarkMode = colorScheme === 'dark';
  const isDarkMode = theme !== null ? theme === 'dark' : isSystemDarkMode;
  const styles = isDarkMode ? darkStyles : lightStyles;
  const navigation = useNavigation();
    const isFocused = useIsFocused();
const [showPrevMonthExportInput, setShowPrevMonthExportInput] = useState(false);
const [showPrevMonthImportInput, setShowPrevMonthImportInput] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('solar-data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.generation) setGeneration(parsedData.generation);
          if (parsedData.exportUnits) setExportUnits(parsedData.exportUnits);
          if (parsedData.prevmonthExport) setprevmonthExport(parsedData.prevmonthExport);
          if (parsedData.prevmonthimport) setprevmonthImport(parsedData.prevmonthimport);
          if (parsedData.importUnits) setImportUnits(parsedData.importUnits);
          if (parsedData.tariff) {
            setTariff(parsedData.tariff);
          } else {
            setShowTariffInput(true);
          }
        } else {
          setShowTariffInput(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
    // AsyncStorage.clear()
  }, []);

  const saveToStorage = async () => {
    try {
      await AsyncStorage.setItem(
        'solar-data',
        JSON.stringify({ generation,prevmonthExport ,exportUnits,prevmonthimport, importUnits, tariff })
      );
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };


  const saveTariffAndCloseInput = () => {
    if (tariff) {
      saveToStorage();
      setShowTariffInput(false);
    } else {
      Alert.alert('Please enter a valid tariff value.');
    }
  };

  const clearTariff = async () => {
    setTariff('');
    await AsyncStorage.setItem('solar-data', JSON.stringify({ tariff: '' }));
    setShowTariffInput(true);
  };
const closetraffic = () => {
  if (tariff === '') {
    setTariff('0'); // Set tariff to 0 if it's empty
  }
  setShowTariffInput(false); // Close the input
};

const calculate = () => {
  if (!exportUnits || !importUnits || !tariff) {
    Alert.alert(
      'Missing Fields',
      'Please enter values for Export Units, Import Units, and Tariff.',
      [{ text: 'OK', style: 'default' }]
    );
    return;
  }

  const g = generation ? parseFloat(generation) : null;
  const pe = parseFloat(prevmonthExport);
  const pi = parseFloat(prevmonthimport);
  const e = parseFloat(exportUnits);
  const i = parseFloat(importUnits);
  const t = parseFloat(tariff);

  if ((g !== null && g < 0) || pe < 0 || pi < 0 || e < 0 || i < 0 || t < 0) {
    Alert.alert('Invalid Input', 'Values cannot be negative.', [{ text: 'OK' }]);
    return;
  }

  if ((g !== null && isNaN(g)) || isNaN(pe) || isNaN(pi) || isNaN(e) || isNaN(i) || isNaN(t)) {
    Alert.alert('Invalid Input', 'Please enter valid numeric values.', [{ text: 'OK' }]);
    return;
  }

  const preexport = e - pe;
  const preimport = i - pi;
  const netExport = preexport - preimport;
  const netBill = netExport < 0 ? Math.abs(netExport) * t : 0;
  const credit = netExport > 0 ? netExport * t : 0;
  const selfConsumed = g !== null ? g - preexport : 'N/A';
  const currentMonthConsumed = g !== null ? preimport + (g - preexport) : 'N/A';
  const totalConsumed = g !== null ? i + (g - e) : 'N/A';

  setResults({
    importUnits: parseFloat(preimport.toFixed(2)),
    netExport: parseFloat(netExport.toFixed(2)),
    netBill: parseFloat(netBill.toFixed(2)),
    credit: parseFloat(credit.toFixed(2)),
    savings: parseFloat((preimport * t).toFixed(2)),
    selfConsumed: selfConsumed !== 'N/A' ? parseFloat(selfConsumed.toFixed(2)) : 'N/A',
    currentMonthConsumed: currentMonthConsumed !== 'N/A' ? parseFloat(currentMonthConsumed.toFixed(2)) : 'N/A',
    totalConsumed: totalConsumed !== 'N/A' ? parseFloat(totalConsumed.toFixed(2)) : 'N/A',
    // currentmonthImport: parseFloat(i.toFixed(2)),
    totalToPay: parseFloat((netBill || 0).toFixed(2))
  });

  saveToStorage();
};


  const handleClear = () => {
    setGeneration('');
    setExportUnits('');
    setprevmonthExport('');
    setprevmonthImport('');
    setImportUnits('');
    setResults(null);
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme); // Save the theme preference
  };
  useEffect(() => {
    const checkPolicyAccepted = async () => {
      try {
        const accepted = await AsyncStorage.getItem('privacyAccepted');
        if (!accepted) {
          setShowModal(true);
        }
      } catch (e) {
        console.error('Error reading storage:', e);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      checkPolicyAccepted();
    }
  }, [isFocused]);

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem('privacyAccepted', 'true');
      setShowModal(false);
    } catch (e) {
      console.error('Error saving acceptance:', e);
    }
  };
    const handleDecline = () => {
    setShowModal(false);
      BackHandler.exitApp();

  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
return (
  <SafeAreaView style={styles.safeArea}>
    <Modal visible={showModal} transparent animationType="slide">
      <View style={baseStyles.modalWrapper}>
        <View style={baseStyles.modalContent}>
          <Text style={baseStyles.modalTitle}>Terms & Privacy</Text>
          <Text style={baseStyles.modalMessage}>
            By continuing, you agree to our{' '}
            <Text
              style={baseStyles.modalLink}
              onPress={() => {
                setShowModal(false);
                setTimeout(() => {
                  navigation.navigate('PrivacyPolicy');
                }, 100);
              }}
            >
              Privacy Policy
            </Text>.
          </Text>
          <View style={baseStyles.modalButtonGroup}>
            <TouchableOpacity style={baseStyles.modalAcceptBtn} onPress={handleAccept}>
              <Text style={baseStyles.modalBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={baseStyles.modalDeclineBtn} onPress={handleDecline}>
              <Text style={baseStyles.modalBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/solarenergy.jpeg')}
            style={styles.icon}
          />
          <Text style={styles.header}>Solar Calculator</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill={isDarkMode ? 'white' : 'black'}
            >
              <Path d="M12 3V1l-1 2h2l-1-2zm4.6 2.1c-1.6-1.3-3.7-1.8-5.7-1.4C9.5 2.2 8.1 3.6 8.2 5.5c.1 1.6 1.4 2.9 3 2.9 1.1 0 2-.7 2.5-1.7 1.2-.3 2.5.1 3.2 1.1 1.7 2.1 1.3 5.3-.9 7-2.2 1.7-5.4 1.5-7.4-.8-1.6-1.7-2.1-4.2-1.4-6.3 1.2-3.1 4.4-5 7.7-5.3zm-.6 5.4c.8-1 1.1-2.4.5-3.5-.7-1.3-2.2-1.7-3.5-.9-1 .6-1.2 1.9-.6 2.8 1.1.8 2.3.7 3.2-.5z" />
            </Svg>
          </TouchableOpacity>
        </View>

        {tariff && !showTariffInput ? (
          <View style={styles.tariffContainer}>
            <Text style={[styles.tariffText, { color: isDarkMode ? 'white' : 'black' }]}>
              Current Tariff: ₹{tariff}
            </Text>
            <TouchableOpacity onPress={() => setShowTariffInput(true)}>
              <Text style={[styles.editTariff, { color: isDarkMode ? 'yellow' : 'black' }]}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tariffInputContainer}>
            <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>
              Enter Tariff (₹ per unit):
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tariff"
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              value={tariff}
              onChangeText={setTariff}
            />
            <View style={styles.buttonRow}>
              <Button title="Save Tariff" onPress={saveTariffAndCloseInput} />
              <Button title="Clear Tariff" onPress={clearTariff} color="green" />
              <Button title="Cancel" onPress={closetraffic} color="red" />
            </View>
          </View>
        )}

        <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>Current Total Generation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Total Generation"
          keyboardType="numeric"
          value={generation}
          onChangeText={setGeneration}
          editable={!!tariff}
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
        />

{!showPrevMonthExportInput ? (
  <View style={styles.tariffContainer}>
    <Text style={[styles.tariffText, { color: isDarkMode ? 'white' : 'black' }]}>
      Previous Month Export: {prevmonthExport || 0}
    </Text>
    <TouchableOpacity onPress={() => setShowPrevMonthExportInput(true)}>
      <Text style={[styles.editTariff, { color: isDarkMode ? 'yellow' : 'black' }]}>Edit</Text>
    </TouchableOpacity>
  </View>
) : (
  <View style={styles.tariffInputContainer}>
    <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>
      Enter Previous Month Export:
    </Text>
    <TextInput
      style={styles.input}
      placeholder="Prev Month Export"
      keyboardType="numeric"
      value={prevmonthExport}
      onChangeText={setprevmonthExport}
      placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
    />
    <View style={styles.buttonRow}>
      <Button title="Save" onPress={() => setShowPrevMonthExportInput(false)} />
      <Button title="Cancel" onPress={() => setShowPrevMonthExportInput(false)} color="red" />
    </View>
  </View>
)}


        <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>Current Month Export:</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Month Export"
          keyboardType="numeric"
          value={exportUnits}
          onChangeText={setExportUnits}
          editable={!!tariff}
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
        />
      {!showPrevMonthImportInput ? (
  <View style={styles.tariffContainer}>
    <Text style={[styles.tariffText, { color: isDarkMode ? 'white' : 'black' }]}>
      Previous Month Import: {prevmonthimport || 0}
    </Text>
    <TouchableOpacity onPress={() => setShowPrevMonthImportInput(true)}>
      <Text style={[styles.editTariff, { color: isDarkMode ? 'yellow' : 'black' }]}>Edit</Text>
    </TouchableOpacity>
  </View>
) : (
  <View style={styles.tariffInputContainer}>
    <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>
      Enter Previous Month Import:
    </Text>
    <TextInput
      style={styles.input}
      placeholder="Previous Month Import"
      keyboardType="numeric"
      value={prevmonthimport}
      onChangeText={setprevmonthImport}
      placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
    />
    <View style={styles.buttonRow}>
      <Button title="Save" onPress={() => setShowPrevMonthImportInput(false)} />
      <Button title="Cancel" onPress={() => setShowPrevMonthImportInput(false)} color="red" />
    </View>
  </View>
)}


        <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>Current Month Import:</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Month Import"
          keyboardType="numeric"
          value={importUnits}
          onChangeText={setImportUnits}
          editable={!!tariff}
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
        />

        <View style={styles.buttonContainer}>
          <Button title="Calculate" onPress={calculate} disabled={!tariff} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Clear Data" onPress={handleClear} color="red" />
        </View>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultText}>Import Units: {results.importUnits.toFixed(2)}</Text>
            <Text style={styles.resultText}>Net Export: {results.netExport.toFixed(2)} units</Text>
            <Text style={styles.resultText}>Net Bill: ₹{results.netBill.toFixed(2)}</Text>

            <Text style={[styles.resultText, results.credit > 0 && { color: 'green' }]}>
              Export Credit: ₹{results.credit.toFixed(2)}
            </Text>
    <Text
  style={[
    styles.pdc,
    results.pdc <= 0
      ? { color: 'gray' } // no consumption
      : results.pdc < 5
      ? { color: 'green' } // low usage
      : results.pdc < 10
      ? { color: 'orange' } // medium usage
      : { color: 'purple' } // high usage
  ]}
>
  Per Day Consumed : {((results.selfConsumed + results.importUnits)/ new Date().getDate()).toFixed(2)} units
</Text>


            <Text style={[styles.resultText, results.selfConsumed > 0 && { color: 'green' }]}>
              Self Consumed from Solar: {results.selfConsumed.toFixed(2)} units
            </Text>

            {/* <Text style={styles.resultText}>
              Current Month Consumed: {results.currentmonthImport.toFixed(2)} units
            </Text> */}
            <Text style={[styles.resultText, { fontWeight: 'bold' }]}>
              Total units Consumed: {(results.selfConsumed + results.importUnits).toFixed(2)} units
            </Text>

            {results.netExport < 0 ? (
              <Text style={[styles.resultText, { color: 'red' }]}>
                Total to Pay: ₹{results.netBill.toFixed(2)}
              </Text>
            ) : (
              <Text style={[styles.resultText, { color: 'green' }]}>
                Savings: ₹{results.savings.toFixed(2)}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.privacyContainer}>
 
<TouchableOpacity onPress={() => router.push('/PrivacyPolicy')}>
  <Text style={styles.privacytext}>Privacy Policy</Text>
</TouchableOpacity>
        <Text style={styles.footer}>© {new Date().getFullYear()} Developed by STJ</Text>
        <Text style={styles.version}>Version 1.0.1</Text>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

}

const baseStyles = {
  version: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    color: 'gray',  
  },
   modalScreenContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalAcceptBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  modalDeclineBtn: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  modalBtnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

privacytext: {
  color: 'orange',

  textAlign: 'center',
  marginBottom: 10,
  fontSize: 16,
},
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
headerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', // Spread title and toggle
  width: '100%',
  paddingHorizontal: 16, // Padding on both sides
  paddingTop: 16,
  paddingBottom: 8,
  backgroundColor: 'transparent', // Optional, or set theme-based color
},

  toggleContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end', // push to right side
    paddingRight: 16,
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    width: 'auto',
  },
  toggleTheme: {
    marginLeft: 10,
    fontSize: 16,
    color: 'blue',
  },
  tariffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,

  },
  editTariff: {
    marginLeft: 10,
    textDecorationLine: 'underline',
    color: 'blue',
  },
  tariffInputContainer: {
    marginBottom: 20,
    
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  resultsContainer: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  footer: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
};


// Light mode styles
const lightStyles = StyleSheet.create({
  ...baseStyles,
  safeArea: {
    ...baseStyles.safeArea,
    backgroundColor: '#f0f0f0',
  },
  container: {
    ...baseStyles.container,
    backgroundColor: '#fff',
  },
  header: {
    ...baseStyles.header,
    color: '#000',
  },
  input: {
    ...baseStyles.input,
    borderColor: '#ddd',
    color: '#000',
  },
  toggleTheme: {
    ...baseStyles.toggleTheme,
    color: 'blue',
  },
  resultText: {
    ...baseStyles.resultText,
    color: '#000',
  },
  footer: {
    ...baseStyles.footer,
    color: '#000',
  },
});

// Dark mode styles
const darkStyles = StyleSheet.create({
  ...baseStyles,
  safeArea: {
    ...baseStyles.safeArea,
    backgroundColor: '#333',
  },
  container: {
    ...baseStyles.container,
    backgroundColor: '#222',
  },
  header: {
    ...baseStyles.header,
    color: '#fff',
  },
  input: {
    ...baseStyles.input,
    borderColor: '#444',
    color: '#fff',
  },
  toggleTheme: {
    ...baseStyles.toggleTheme,
    color: 'lightgray',
  },
  resultText: {
    ...baseStyles.resultText,
    color: '#fff',
  },
  pdc:{
...baseStyles.resultText,
color: 'blue',

  },
  footer: {
    ...baseStyles.footer,
    color: '#ccc',
  },
});
