import { ThemedText } from "@/components/ThemedText";
import * as obstaclesFunctions from "@/utils/Obstacles";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function EditObstaclePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === undefined || id === "-1"; // Changed check for new item

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      obstaclesFunctions.getAllObstacles().then((obstacles) => {
        const obstacle = obstacles.find((item) => item.id === id);
        if (obstacle) {
          setName(obstacle.name);
          setDescription(obstacle.description);
        } else {
          setName("");
          setDescription("");
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (!name) {
      Alert.alert("Erreur", "Le nom de l'obstacle ne peut pas être vide.");
      return;
    }
    setLoading(true);
    let success = false;
    try {
      const location = await Location.getCurrentPositionAsync({});

      const { latitude, longitude } = location
        ? location.coords
        : { latitude: 0, longitude: 0 };

      if (isNew) {
        success = await obstaclesFunctions.createNewObstacle({
          name,
          description,
          longitude,
          latitude,
        });
      } else {
        success = await obstaclesFunctions.updateExistingObstacle(id!, {
          name,
          description,
          longitude,
          latitude,
        });
      }

      if (success) {
        Alert.alert(
          "Succès",
          `Obstacle ${isNew ? "créé" : "modifié"} avec succès.`
        );
        router.back();
      } else {
        Alert.alert("Erreur", "Une erreur est survenue lors de la sauvegarde.");
      }
    } catch (e) {
      Alert.alert("Erreur", "Une erreur est survenue");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cet obstacle ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: async () => {
            setLoading(true);
            const success = await obstaclesFunctions.deleteObstacle(id);
            setLoading(false);
            if (success) {
              Alert.alert("Succès", "Obstacle supprimé avec succès.");
              router.back();
            } else {
              Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de la suppression."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <ThemedText style={styles.title}>
        {isNew ? "Créer un nouvel obstacle" : "Modifier l'obstacle"}
      </ThemedText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nom de l'obstacle"
        style={styles.textInput}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        style={[styles.textInput, styles.descriptionInput]}
        multiline
      />
      <ThemedText
        style={{ color: "#a3a3a3ff", fontSize: 12, fontStyle: "italic" }}
      >
        Les coordonnées géographiques de l'appareil sont enregistrées
      </ThemedText>
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleSave}
          disabled={loading || !name}
          style={({ pressed }) => [
            styles.button,
            !name || loading ? styles.buttonDisabled : null,
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText style={styles.buttonText}>
            {isNew ? "Créer" : "Enregistrer"}
          </ThemedText>
        </Pressable>
        {!isNew && (
          <Pressable
            onPress={handleDelete}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              styles.deleteButton,
              loading && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>Supprimer</ThemedText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: "bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#383838ff",
    color: "#d3d3d3ff",
    borderRadius: 8,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007bff",
    marginHorizontal: 5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: "#a3a3a3",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
