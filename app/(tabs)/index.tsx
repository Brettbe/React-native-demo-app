import { ThemedText } from "@/components/ThemedText";
import * as obstaclesFunctions from "@/utils/Obstacles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Href, Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Obstacle {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
}

const fetchObstacles = async (): Promise<Obstacle[]> => {
  try {
    const storedObstacles = await AsyncStorage.getItem("obstacles");
    return storedObstacles != null ? JSON.parse(storedObstacles) : [];
  } catch (error) {
    console.error("Failed to load obstacles from AsyncStorage", error);
    return [];
  }
};

export default function MainScreen() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [status, requestPermission] = Location.useForegroundPermissions();

  requestPermission();

  useEffect(() => {
    fetchObstacles().then((data) => {
      setObstacles(data);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchObstacles().then((data) => {
        setObstacles(data);
      });
    });

    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id: number) => {
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
            const success = await obstaclesFunctions.deleteObstacle(
              id.toString()
            );
            setLoading(false);
            if (success) {
              Alert.alert("Succès", "Obstacle supprimé avec succès.");
              fetchObstacles().then((data) => {
                setObstacles(data);
              });
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Obstacles rencontrés par le camion</Text>

      <Link href={"/editObstacle/-1" as Href} style={styles.addButton}>
        <ThemedText style={styles.addButtonText}>Ajouter +</ThemedText>
      </Link>

      <FlatList
        data={obstacles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.obstacleItem}>
            <View style={styles.textContainer}>
              <View>
                <ThemedText style={styles.obstacleName}>{item.name}</ThemedText>
                <ThemedText style={styles.obstacleDescription}>
                  {item.description}
                </ThemedText>
              </View>
              <View style={styles.coordsContainer}>
                <ThemedText>Coords</ThemedText>
                {item.longitude && item.latitude ? (
                  <View style={styles.coordsContainer}>
                    <ThemedText style={styles.coords}>
                      {item.longitude}
                    </ThemedText>
                    <ThemedText style={styles.coords}>
                      {item.latitude}
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText>Aucune coordonnée à afficher</ThemedText>
                )}
              </View>
            </View>
            <View style={styles.buttonsContainer}>
              <Link
                href={`/editObstacle/${item.id}` as Href}
                style={styles.editButton}
              >
                <ThemedText style={styles.editButtonText}>Modifier</ThemedText>
              </Link>
              <Button
                title="Supprimer"
                onPress={() => handleDelete(item.id)}
                color="#ef4444"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Aucun obstacle</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 80,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  textContainer: {
    gap: 20,
    width: "50%",
  },
  coordsContainer: {
    alignItems: "center",
  },
  coords: {
    fontSize: 12,
    color: "#646464ff",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  addButton: {
    alignSelf: "flex-end",
    width: 100,
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    borderRadius: 8,
    textAlign: "center",
    margin: 20,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  editButton: { padding: 10 },
  editButtonText: {
    color: "rgba(0, 122, 10, 1)",
    fontWeight: "600",
    fontSize: 18,
  },
  obstacleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#202020ff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  obstacleName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
  },
  obstacleDescription: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
});
