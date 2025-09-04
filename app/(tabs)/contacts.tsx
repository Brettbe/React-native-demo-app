import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet, View } from "react-native";

const contacts = [
  { id: "1", name: "Police", phone: "17" },
  { id: "2", name: "Pompiers", phone: "18" },
  { id: "3", name: "Samu", phone: "15" },
  { id: "5", name: "Urgences Européennes", phone: "112" },
];

export default function ContactsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Contacts Utiles</ThemedText>
      <FlatList
        data={contacts}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <ThemedText style={styles.contactName}>{item.name}</ThemedText>
            <ThemedText style={styles.contactPhone}>{item.phone}</ThemedText>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  contactName: {
    fontSize: 18,
  },
  contactPhone: {
    fontSize: 18,
    color: "#007AFF",
  },
});
