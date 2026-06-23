import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchTenant, useFetchMembers } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

export default function AboutMandalScreen() {
  const { tenantId } = useAuthStore();
  const { data: tenant, isLoading: loadingTenant } = useFetchTenant(tenantId || null);
  const { data: members = [], isLoading: loadingMembers } = useFetchMembers({ role: "admin" });

  const handleOpenMap = () => {
    const address = tenant?.address || "Plot 42, Ganesha Chowk, Sector 12, Navi Mumbai, Maharashtra 400706";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch((err) => console.error("Couldn't load map", err));
  };

  const handleCall = () => {
    Linking.openURL("tel:+919876543210").catch((err) => console.error("Couldn't place call", err));
  };

  const handleEmail = () => {
    Linking.openURL("mailto:contact@saiganpati.org").catch((err) => console.error("Couldn't send email", err));
  };

  // Mock committee data in case members list is empty
  const mockCommittee = [
    {
      id: "m1",
      full_name: "Rajesh V. Patil",
      role: "President",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD1ogZ8dpPviVCJSCXPZqGrjvPwOmX-JzVUICm_85F1RJnloX6t0Fl1TgJ3xlmuMvzCUkxK3DSGd7J7nGjZLkSYZeonFrmpGNHbbTaOV_ErDS2D8t718s6vSVwGltY9oqrEBZ8TZ1jXLaelasK5pD_o55JOXYv6GSnGSH70fbQe8o8XE0Ozdg4EDzM4bBrg0KUx1hnzmicA13gLu4Vx45JrOO0ulH2RXg9FxOo-hZO2I6EF-sPsDYWB",
    },
    {
      id: "m2",
      full_name: "Anjali S. Deshmukh",
      role: "Secretary",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBC6SSfuGQzeFpA8m0gkAS26xBhoogWI7IOU_OckpzNdUE7J8itUIVTyZoWqel5_1O9QJ8HPEnphmpIU7_hrcktgyS1fn5JWaG9LuXUPwjJaidMemuxRDn5R69A6jZhJ3VM3E6rTjtjrZk-2SSzR84-zcATonL95MPcWoPCm0hyfCKWieeYCLyp0jUig6r4kO376g8fzz9rjqR2weD5d_b3d6Qld7lUiqRV7MDtwqK0SC8Wb8bqWiyp",
    },
    {
      id: "m3",
      full_name: "Sandeep K. Kulkarni",
      role: "Treasurer",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA-VKoEOeaPPEcReE5wR5WjAFFWgRAIulG-jDzS_n8Zg0WelpAOXswtTvurnjGUrsMWAGYFuxfdm0-ePZP7rHEzW0jHYhuUeNz1ZmGsQLcNMiCxMu2OTlltepNg4KVOjgO1S_SsDlw9GjCVmnlMPgbp1O7rSc5skKQ8ltqf_Bz-fOzfb2Rpi5a8omZSizK1e5o7gK9W3iTupHDIRXzQ4FwTf_SMePD-erMxBWn53MzjjB0S9dtxHKMc",
    },
  ];

  // Map backend roles to readable titles
  const getRoleTitle = (member: any) => {
    if (member.role === "owner") return "President";
    if (member.role === "admin") return "Secretary";
    if (member.role === "committee_member") return "Committee Member";
    return member.role || "Volunteer";
  };

  const committeeMembers = members.length
    ? members.slice(0, 3).map((m: any) => ({
        id: m.id,
        full_name: m.full_name,
        role: getRoleTitle(m),
        avatar_url: m.avatar_url,
      }))
    : mockCommittee;

  const mandalName = tenant?.name || "Shri Sai Ganpati Mandal";
  const mandalDesc =
    tenant?.description ||
    "Founded with a humble vision in a small neighborhood, Shri Sai Ganpati Mandal has grown into a pillar of community celebration. Our journey began with a handful of dedicated volunteers who sought to bring the spirit of Ganeshotsav to every doorstep.\n\nOver the decades, we have transitioned from simple celebrations to hosting some of the city's most visually stunning and spiritually uplifting festivals. Each year, our idol represents a unique theme, blending modern artistry with sacred Vedic traditions.\n\nBeyond the festivities, our Mandal is committed to social welfare, organizing annual blood donation camps, educational scholarships, and local infrastructure improvements.";

  const foundedYear = tenant?.founded_year || 1995;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          About Our Mandal
        </Text>
        <TouchableOpacity style={styles.notifyBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri:
                tenant?.banner_url ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA2ntcMhEjnPt0iZ0cTv2PzDvZ0PhmfNfZD7jHHtc3Ob8BtK3H4sjuWUl829JWIpelMxVB-yLg2zD3WjDjzOmGxAXnCL2M3cG-RpfGZJOIbUU0Nk0VbeerzAviG21NOhH7m4WUkaxMXL7RnepGbIKpcpMqo3M7aFsHKxZ9gVkAt3avbfGx-VKEu1kC69bZWslabds2-voFEsItZVsqbK_Z77cLpp3Zc3cDrokCXumarLmH8rksK-mKD",
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{mandalName}</Text>
            <Text style={styles.heroSubtitle}>
              Preserving tradition, celebrating community, and fostering spiritual growth since {foundedYear}.
            </Text>
          </View>
        </View>

        {/* Our Journey Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Our Journey</Text>
          <View style={styles.journeyContent}>
            <Text style={styles.journeyText}>{mandalDesc}</Text>
          </View>

          {/* Grid Images */}
          <View style={styles.imageGrid}>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRKVU9f8ei0nL_xsoNwV4QoQnbBLYZESTyTfylAGjxRiiVXkA4VYtoTLeFv1YI2QcDlxqYqztiJzac6LsFVtcvrZmmWBKTWpjpVBjjKCfrcs4aJUXlgfoeAH3e5h35WgouxZn5KxilsHB9phfnzhbNr2Q1zF3dAmV7DXi-FEde4EWZGWiBifQPWNoKpU7myyHFoG0HdwkBPYqJLdywLdK-ieTkfr4MzWTVvZhWto1iBjNJkl4AzYwd",
              }}
              style={[styles.gridImage, { borderBottomLeftRadius: 16 }]}
            />
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqPNrh8lY9nNEQPi_Xzd8O-uUgyfVzbmyIhNeuySJ7cyd67cfC5T_KsVAD1oNxHl-PxMA5NgH9_e3wtBsO-0P0stHTaepN44LU8dkcOkgnEUeDkgD7JWAUKjFUJZ-ekkWMcjSxhml3Q25gCTBEruqr4khzet0PNV9HtFuwKE4HXkVgFDv3SUKBSywb4g2xtRKnEafslVuFa0HYnDNjvTX7EyLFQ480uYu69kWSFywZLLJ9IkQ4Uta1",
              }}
              style={[styles.gridImage, { borderTopRightRadius: 16, marginTop: 16 }]}
            />
          </View>
        </View>

        {/* Meet the Committee */}
        <View style={[styles.section, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={styles.sectionHeader}>Meet the Committee</Text>
          {loadingMembers ? (
            <ActivityIndicator size="small" color={colors.primaryContainer} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.committeeGrid}>
              {committeeMembers.map((member) => (
                <View key={member.id} style={styles.committeeCard}>
                  <View style={styles.avatarBorder}>
                    {member.avatar_url ? (
                      <Image source={{ uri: member.avatar_url }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <MaterialCommunityIcons name="account" size={32} color={colors.outline} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.committeeName}>{member.full_name}</Text>
                  <Text style={styles.committeeRole}>{member.role}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Contact and Location */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Get in Touch</Text>

          <View style={styles.contactList}>
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <MaterialCommunityIcons name="map-marker" size={24} color={colors.primaryContainer} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Our Address</Text>
                <Text style={styles.contactValue}>
                  {tenant?.address || "Plot 42, Ganesha Chowk, Sector 12, Navi Mumbai, Maharashtra 400706"}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.contactItem} onPress={handleCall} activeOpacity={0.7}>
              <View style={styles.contactIcon}>
                <MaterialCommunityIcons name="phone" size={24} color={colors.primaryContainer} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Call Us</Text>
                <Text style={[styles.contactValue, styles.linkText]}>+91 98765 43210</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleEmail} activeOpacity={0.7}>
              <View style={styles.contactIcon}>
                <MaterialCommunityIcons name="email" size={24} color={colors.primaryContainer} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={[styles.contactValue, styles.linkText]}>
                  {tenant?.website_url ? `contact@${tenant.slug}.org` : "contact@saiganpati.org"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Styled Map Placeholder */}
          <View style={styles.mapContainer}>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdCd6QTk3aUMaOkiauSVozLiu9kiiR2xPOOh9bfQyNK3WrD-SKObQq507s1CnM69i5G0VPhjHD48SLg7C5SRzMH9VXaczEQRFAADQ9QEi0YNPy6qN1MahwI2DnJv1FhTPslIc4HaEoBFwENV71Eh76lr0IaBe8lqQwa85UasVXG6uPPM7c2C0qdo8k1ohni3-oyCcSAiQ7GnKep4U82n25cTXxhpmjJ50PCN0vQ5aPwmlmAwpsmOxr",
              }}
              style={styles.mapImage}
            />
            <View style={styles.mapGlassCard}>
              <MaterialCommunityIcons name="map-marker-radius" size={32} color={colors.primaryBrand} />
              <Text style={styles.mapText}>Visit the Mandal</Text>
              <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap} activeOpacity={0.85}>
                <Text style={styles.mapBtnText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    flex: 1,
    marginLeft: 8,
  },
  notifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    height: 240,
    position: "relative",
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(58, 53, 48, 0.65)",
  },
  heroTextContainer: {
    padding: spacing.lg,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    marginBottom: spacing.md,
  },
  journeyContent: {
    marginBottom: spacing.lg,
  },
  journeyText: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  imageGrid: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  gridImage: {
    flex: 1,
    height: 160,
    resizeMode: "cover",
    backgroundColor: colors.cream,
  },
  committeeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  committeeCard: {
    flex: 1,
    minWidth: "28%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarBorder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: colors.primaryContainer,
    padding: 2,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginBottom: 8,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  committeeName: {
    fontSize: 12,
    fontFamily: fonts.poppins.semibold,
    color: colors.charcoal,
    textAlign: "center",
  },
  committeeRole: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: "center",
  },
  contactList: {
    gap: 16,
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.charcoal,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.semibold,
  },
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.55,
  },
  mapGlassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.6)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: "75%",
  },
  mapText: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    marginTop: 4,
    marginBottom: 10,
  },
  mapBtn: {
    backgroundColor: colors.primaryBrand,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
});
