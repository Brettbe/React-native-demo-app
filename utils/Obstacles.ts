import AsyncStorage from "@react-native-async-storage/async-storage";

interface Obstacle {
  id: string;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
}

const STORAGE_KEY = "obstacles";

export const getAllObstacles = async (): Promise<Obstacle[]> => {
  try {
    const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedItems) {
      return [];
    }
    const parsedItems = JSON.parse(storedItems);
    // Check if the parsed data is an array. If not, assume it's a single object
    // and return it wrapped in an array to prevent the TypeError.
    if (!Array.isArray(parsedItems)) {
      console.warn("AsyncStorage data was not an array. Recovering.");
      return [parsedItems];
    }
    return parsedItems;
  } catch (error) {
    console.error("Failed to fetch or parse obstacles:", error);
    return [];
  }
};

export const createNewObstacle = async (
  data: Omit<Obstacle, "id">
): Promise<boolean> => {
  try {
    const existingObstacles = await getAllObstacles();
    const newObstacle: Obstacle = {
      id: Date.now().toString(), // Use timestamp for a more robust unique ID
      ...data,
    };
    const updatedObstacles = [...existingObstacles, newObstacle];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedObstacles));
    return true;
  } catch (error) {
    console.error("Failed to create new obstacle:", error);
    return false;
  }
};

export const updateExistingObstacle = async (
  id: string,
  data: Omit<Obstacle, "id">
): Promise<boolean> => {
  try {
    const existingObstacles = await getAllObstacles();
    const updatedObstacles = existingObstacles.map((obstacle) =>
      obstacle.id === id ? { ...obstacle, ...data } : obstacle
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedObstacles));
    return true;
  } catch (error) {
    console.error("Failed to update obstacle:", error);
    return false;
  }
};

export const deleteObstacle = async (id: string): Promise<boolean> => {
  try {
    const existingObstacles = await getAllObstacles();
    const updatedObstacles = existingObstacles.filter(
      (obstacle) => obstacle.id !== id
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedObstacles));
    return true;
  } catch (error) {
    console.error("Failed to delete obstacle:", error);
    return false;
  }
};
