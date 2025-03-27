//country-component/CountrySelect.tsx

import React, { useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  View,
  Dimensions,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import countries from './CountryList';

export type Country = {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
};

type CountrySelectProps = {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
};

const CountrySelect = ({
  selectedCountry,
  setSelectedCountry,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  return (
    <View className="w-[30%] h-[100%]">
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center px-2 py-1"
      >
        <Text className="text-xl">
          {selectedCountry.flag} {selectedCountry.dial_code}
        </Text>
        <Entypo name="chevron-down" size={16} color="gray" />
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 justify-end items-center bg-black/30"
        >
          <View 
            className="w-full max-h-96 bg-white border-t border-gray-300 rounded-t-lg shadow-lg"
            style={{ width: screenWidth * 0.9 }}
          >
            <ScrollView>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  onPress={() => {
                    setSelectedCountry(country);
                    setOpen(false);
                  }}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-sm text-gray-700">
                    {country.flag} {country.name} {country.dial_code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CountrySelect;