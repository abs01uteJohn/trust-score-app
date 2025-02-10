import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuthRequest } from 'expo-auth-session';  // For Google Login
import * as Facebook from 'expo-facebook';  // For Facebook Login
import axios from 'axios';  // For API calls

const BACKEND_URL = 'https://trust-score-backend.vercel.app/trust-score-backend'; // Replace with your actual backend URL

export default function App() {
  const [user, setUser] = useState(null);  // Stores logged-in user data
  const [trustScore, setTrustScore] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch trust score after login
  const fetchTrustScore = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/get_trust_score.php?user_id=${userId}`);
      setTrustScore(response.data);
    } catch (error) {
      console.error('Error fetching trust score:', error);
      Alert.alert('Error', 'Unable to retrieve trust score.');
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = async () => {
    const { request, response, promptAsync } = useAuthRequest({
      clientId: '543437855241-g0t4rtnhvg4fpv1kaq0u0ooakqsulbuj.apps.googleusercontent.com', // Replace with your client ID
    });

    if (response?.type === 'success') {
      const { id_token } = response.params;

      try {
        const res = await axios.post(`${BACKEND_URL}/update-trust-score.php`, { token: id_token });
        if (res.data.user_id) {
          setUser(res.data); // Store user data
          fetchTrustScore(res.data.user_id); // Fetch trust score
        } else {
          Alert.alert('Login Failed', 'Could not verify user.');
        }
      } catch (error) {
        console.error('Error sending token to backend', error);
        Alert.alert('Error', 'Login failed.');
      }
    } else {
      Alert.alert('Login Failed', 'Unable to log in with Google.');
    }
  };

  // Facebook login function
  const facebookLogin = async () => {
    try {
      await Facebook.initializeAsync({
        appId: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
      });

      const { type, token } = await Facebook.logInWithReadPermissionsAsync();
      if (type === 'success') {
        try {
          const res = await axios.post(`${BACKEND_URL}/update-trust-score.php`, { token });
          if (res.data.user_id) {
            setUser(res.data); // Store user data
            fetchTrustScore(res.data.user_id); // Fetch trust score
          } else {
            Alert.alert('Login Failed', 'Could not verify user.');
          }
        } catch (error) {
          console.error('Error sending token to backend', error);
          Alert.alert('Error', 'Login failed.');
        }
      } else {
        Alert.alert('Login Failed', 'Unable to log in with Facebook.');
      }
    } catch (e) {
      Alert.alert('Facebook Login Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      {!user ? (
        <>
          <Text>Login to continue</Text>
          <Button title="Login with Google" onPress={googleLogin} />
          <Button title="Login with Facebook" onPress={facebookLogin} />
        </>
      ) : (
        <>
          <Text>Welcome, {user.full_name}!</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <Text>Trust Score: {trustScore?.score ?? 'N/A'}</Text>
              <Text>Grade: {trustScore?.grade ?? 'N/A'}</Text>
              <Text>Linked Accounts: {trustScore?.linked_accounts ?? 0}</Text>
              <Text>Platforms: {trustScore?.platforms ?? 'None'}</Text>
            </>
          )}
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
