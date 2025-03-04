import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";

import { Audio } from "expo-av";
// import { Pusher } from "@pusher/pusher-websocket-react-native";
import { RequestItem, ManagerApprovalRequest, ManagerApprovalRequestStatus } from "../types/types";
import { getMockedRequest } from "./utils";

const renderApprovalDescription = (item: RequestItem) => {
  switch (item.type) {
    case "DISCOUNT":
      return (
        <Text style={styles.approvalDescription}>
          <Text style={styles.boldText}>{item.staffUserFullName} </Text> would like to apply discounts to an order
        </Text>
      );
    case "EARLY_CLOCKIN":
      return (
        <Text style={styles.approvalDescription}>
          <Text style={styles.boldText}>{item.staffUserFullName}</Text> would like to
          clock in{" "}
          <Text style={styles.boldText}>{item.diffFromScheduledTime}</Text> (
          <Text style={styles.boldText}>{item.clockInTime}</Text>) earlier than
          their scheduled start time (
          <Text style={styles.boldText}>{item.scheduledStartTime}</Text>).
        </Text>
      );
    default:
      return (
        <Text style={styles.approvalDescription}>Unknown request type</Text>
      );
  }
};

const renderProcessedRequestDescription = (item: RequestItem) => {
  switch (item.type) {
    case "DISCOUNT":
      return (
        <Text style={styles.approvalDescription}>
          <Text style={styles.boldText}>{item.staffUserFullName}</Text> had requested to apply discounts
        </Text>
      );
    case "EARLY_CLOCKIN":
      return (
        <Text style={styles.approvalDescription}>
          <Text style={styles.boldText}>{item.staffUserFullName}</Text> had requested to
          clock in{" "}
          <Text style={styles.boldText}>{item.diffFromScheduledTime}</Text> (
          <Text style={styles.boldText}>{item.clockInTime}</Text>) earlier than
          their scheduled start time (
          <Text style={styles.boldText}>{item.scheduledStartTime}</Text>).
        </Text>
      );
    default:
      return (
        <Text style={styles.approvalDescription}>Unknown request type</Text>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#11161C",
    padding: 15,
  },
  addButton: {
    backgroundColor: "#2ECC71",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  approvalRequest: {
    backgroundColor: "#017A7A",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  approvalTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  approvalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rejectButton: {
    backgroundColor: "#8B0000",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  approveButton: {
    backgroundColor: "#006400",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  rejectText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  approveText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  welcomeText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 30,
    paddingBottom: 20,
  },
  name: {
    color: "#2ECC71",
  },
  locationText: {
    color: "white",
    fontSize: 16,
  },
  quickServices: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 10,
    paddingTop: 0,
    marginTop: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  serviceIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceItem: {
    alignItems: "center",
  },
  serviceText: {
    color: "white",
    marginTop: 5,
  },
  requestDetails: {
    color: "white",
    marginTop: 5,
  },
  requestAmount: {
    fontWeight: "bold",
    color: "white",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestCard: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  approved: {
    backgroundColor: "green",
  },
  rejected: {
    backgroundColor: "#B00020",
  },
  requestTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  approvalDescription: {
    color: "white",
    fontSize: 14,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptySubText: {
    color: "#888",
    fontSize: 14,
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    backgroundColor: "#2ECC71",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  activityIndicator: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    top : '50%',
    left: '50%',
    zIndex: 99999,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});


export default function ManagerScreen() {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  // const [pusher, setPusher] = useState<Pusher | null>(null);
  const [newRequestsState, setNewRequestsState] = useState<ManagerApprovalRequest[]>([]);
  const [pastRequestsState, setPastRequestsState] = useState<ManagerApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const seenUuids = useRef(new Set());
  const { username } = useAuth();

  useEffect(() => {
    const fetchApprovalRequests = async () => {
      try {
        const pastRequests = await axios.get('http://100.84.87.96:8013/frontend/operational-menu/v2/venues/MOCKDONALDS_TORONTO/discounts/approval-requests?statusList=APPROVED,REJECTED&sortDesc=responseSentAt', {
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        // console.log(JSON.stringify(pastRequests.data))
        setPastRequestsState(pastRequests.data);
        const newRequests = await axios.get('http://100.84.87.96:8013/frontend/operational-menu/v2/venues/MOCKDONALDS_TORONTO/discounts/approval-requests?statusList=REQUESTED', {
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const newRequestsData = newRequests.data;

        // If the requests were approved somewhere else, just remove them from here
        // and the old request API will just load it in the view below
        setNewRequestsState((prevRequests) => 
          prevRequests.filter(req => newRequestsData.some((newReq: ManagerApprovalRequest) => newReq.uuid === req.uuid))
        );
        
        // Because server sends latest requests first, but our addNewRequest method stacks new rows above old rows, 
        // we reverse the array to process the old rows first so that newest row is processes at the end
        newRequestsData.reverse().forEach((request: ManagerApprovalRequest) => {
          if (!seenUuids.current.has(request.uuid)) {
            seenUuids.current.add(request.uuid);
            addNewRequest(request);
          }
        });
      } catch (error) {
        console.error("Error fetching approval requests:", error);
      }
    };

    const interval = setInterval(fetchApprovalRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  // PUSHER IMPLEMENTATION
  // useEffect(() => {
  //   const initializePusher = async () => {
  //     try {
  //       const pusherInstance = Pusher.getInstance();
  //       await pusherInstance.init({
  //         apiKey: '80a67fbfd1117a6525e2',
  //         cluster: 'mt1'
  //       });

  //       await pusherInstance.connect();
  //       setPusher(pusherInstance);

  //       pusherInstance.subscribe({
  //         channelName: '24477-taha',
  //         onEvent: (data) => {
  //           console.log("Received data from Pusher:", data);
  //           // Handle received data (e.g., updating state)
  //         }
  //       })

  //       console.log("Pusher initialized and connected");
  //     } catch (error) {
  //       console.error("Error initializing Pusher:", error);
  //     }
  //   };

  //   initializePusher();

  //   return () => {
  //     if (pusher) {
  //       pusher.disconnect();
  //     }
  //   };
  // }, []);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

//   const addNewRequestHandler = () => {
//     addNewRequest(getMockedRequest());
//   };

  const addNewRequest = async (request: ManagerApprovalRequest) => {


    fadeAnim.setValue(0);
    slideAnim.setValue(0);

    setNewRequestsState((prevRequests) => [request, ...prevRequests]);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/sounds/notification.wav")
    );
    await sound.playAsync();
  };

  const triggerResponse = async (uuid: string, status: ManagerApprovalRequestStatus.APPROVED | ManagerApprovalRequestStatus.REJECTED) => {
    setLoading(true);

    const url = `http://100.84.87.96:8013/invenue/operational-menu/v2/venues/MOCKDONALDS_TORONTO/discounts/approval-requests/${uuid}/response`;

    const resp = await axios.post(
      url, 
      JSON.stringify({ status }),
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(resp.data)

    // MOCK APPROVAL OR REJECTION BACKEND CALL
    // setTimeout(() => {
      // setNewRequestsState((prevRequests) => {
      //   const processedRequest = prevRequests.find(
      //     (request) => request.uuid === uuid
      //   );
      //   if (!processedRequest) {
      //     throw new Error("Request not found");
      //   }

      //   // Add the approved/rejected request to the past requests state
      //   setPastRequestsState((prevPastRequests) => [
      //     { ...processedRequest, status },
      //     ...prevPastRequests,
      //   ]);

      //   // Remove the approved/rejected request from the new requests state
      //   return prevRequests.filter((request) => request.uuid !== uuid);
      // });
      setLoading(false);
    // }, 1000);
  };

  return (
    <View style={styles.container}>
      {loading ? (
                  <ActivityIndicator size="large" color="#FFFFFF" style={styles.activityIndicator} />
                ) : (<></>)}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, <Text style={styles.name}>{ username }</Text>
        </Text>
      </View>

      {/*
      <View style={styles.quickServices}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setIsCollapsed(!isCollapsed)}
        >
          <Text style={styles.sectionTitle}>Quick Services</Text>
          <MaterialIcons
            name={isCollapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        {!isCollapsed && (
          <View style={styles.serviceIcons}>
            <TouchableOpacity style={styles.serviceItem}>
              <FontAwesome5 name="chart-bar" size={28} color="white" />
              <Text style={styles.serviceText}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceItem}>
              <FontAwesome5 name="users" size={28} color="white" />
              <Text style={styles.serviceText}>Staff</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceItem}>
              <FontAwesome5 name="chart-line" size={28} color="white" />
              <Text style={styles.serviceText}>Activity</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
*/}
      {newRequestsState.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nothing to do!</Text>
          <Text style={styles.emptySubText}>Go grab a coffee ☕</Text>
        </View>
      ) : (
        <FlatList
          data={newRequestsState}
          keyExtractor={(item) => item.uuid}
          style={{ height: 300 }}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                index === 0 && {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.approvalRequest}>
                <Text style={styles.approvalTitle}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>{" "}
                  <Text style={{ fontWeight: "bold" }}>{item.data.typeLabel}</Text>
                </Text>
                <Text style={styles.approvalDescription}>
                  {renderApprovalDescription(item.data)}
                </Text>
            
                  <View style={styles.approvalButtons}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => triggerResponse(item.uuid, ManagerApprovalRequestStatus.REJECTED)}
                      disabled={loading}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => triggerResponse(item.uuid, ManagerApprovalRequestStatus.APPROVED)}
                      disabled={loading}
                    >
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
              </View>
            </Animated.View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Text style={styles.sectionTitle}>Previous Requests</Text>

      <FlatList
        data={pastRequestsState}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <View
            style={[
              styles.requestCard,
              item.status === "APPROVED" ? styles.approved : styles.rejected,
            ]}
          >
            <Text style={styles.requestTitle}>{item.data.typeLabel}</Text>
            {renderProcessedRequestDescription(item.data)}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* <TouchableOpacity style={styles.floatingButton} onPress={addNewRequestHandler}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity> */}
    </View>
  );
}
