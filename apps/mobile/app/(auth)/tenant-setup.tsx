import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { useAuthStore } from "@utsav/stores";
import { useCreateTenant } from "@utsav/api-client";
import { router } from "expo-router";

export default function MobileTenantSetupScreen() {
  const [step, setStep] = useState(1);
  const [tenantName, setTenantName] = useState("");
  const [vertical, setVertical] = useState("ganpati");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "gu">("en");
  
  const createTenantMutation = useCreateTenant();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleNext = () => {
    if (step === 1 && !tenantName.trim()) {
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    try {
      await createTenantMutation.mutateAsync({
        name: tenantName,
        slug: slug,
        vertical: vertical,
        city: location || "Mumbai",
        state: "Maharashtra", // Default state
        address: location ? `Mandal located in ${location}` : "Mumbai, Maharashtra",
        default_language: language,
      });
      router.replace("/(dashboard)/home");
    } catch (err: any) {
      Alert.alert("Onboarding Error", err.message || "Failed to create Mandal. Please try again.");
    }
  };

  const isLoading = createTenantMutation.isPending;

  const verticals = [
    { id: "ganpati", label: "Ganpati Mandal", icon: "🪔" },
    { id: "temple", label: "Temple Trust", icon: "🕌" },
    { id: "navratri", label: "Navratri Utsav", icon: "💃" },
    { id: "cultural", label: "Cultural Association", icon: "🎨" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>Step {step} of 3</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressIndicator, { width: `${(step / 3) * 100}%` }]} />
          </View>
        </View>

        {/* STEP 1: ORGANIZATION NAME */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Let's name your Mandal</Text>
            <Text style={styles.stepSub}>Enter the public name of your cultural committee or organization.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mandal Name *</Text>
              <TextInput
                style={styles.input}
                value={tenantName}
                onChangeText={setTenantName}
                placeholder="e.g. Lalbaugcha Raja Mandal"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

        {/* STEP 2: CHOOSE VERTICAL */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Mandal Vertical</Text>
            <Text style={styles.stepSub}>Which category best fits your community initiative?</Text>

            <View style={styles.grid}>
              {verticals.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.gridCard, vertical === item.id && styles.gridCardActive]}
                  onPress={() => setVertical(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                  <Text style={[styles.cardLabel, vertical === item.id && styles.cardLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: LOCATION & LANGUAGE */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Location & Language</Text>
            <Text style={styles.stepSub}>Set the main location and language workspace settings.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location / City</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Mumbai, Maharashtra"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Default Language</Text>
              <View style={styles.languageContainer}>
                {(["en", "hi", "gu"] as const).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langButton, language === lang && styles.langButtonActive]}
                    onPress={() => setLanguage(lang)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langText, language === lang && styles.langTextActive]}>
                      {lang === "en" ? "English" : lang === "hi" ? "हिन्दी" : "ગુજરાતી"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Action Controls */}
        <View style={styles.actions}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={isLoading} activeOpacity={0.8}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          <TouchableOpacity
            style={[styles.nextButton, step === 1 && !tenantName.trim() && styles.disabledButton]}
            onPress={handleNext}
            disabled={isLoading || (step === 1 && !tenantName.trim())}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.nextButtonText}>{step === 3 ? "Complete Onboarding" : "Next"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "space-between",
  },
  progressHeader: {
    marginTop: 10,
    marginBottom: 20,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginTop: 8,
  },
  progressIndicator: {
    height: "100%",
    backgroundColor: "#FF9500",
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "System",
  },
  stepSub: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    width: "47%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  gridCardActive: {
    borderColor: "#FF9500",
    backgroundColor: "#FFFBEB",
  },
  cardIcon: {
    fontSize: 32,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  cardLabelActive: {
    color: "#FF9500",
  },
  languageContainer: {
    flexDirection: "row",
    gap: 8,
  },
  langButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  langButtonActive: {
    borderColor: "#FF9500",
    backgroundColor: "#FFFBEB",
  },
  langText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  langTextActive: {
    color: "#FF9500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "bold",
  },
  nextButton: {
    flex: 2,
    backgroundColor: "#FF9500",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
});
