import { NextResponse } from "next/server";
import { verifySession, createServiceRoleClient } from "../../utils";

export async function GET(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: member, error: dbError } = await supabase
    .from("tenant_members")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const email = userData?.user?.email || "";

  if (dbError || !member) {
    // Return fallback profile using Auth metadata since user exists in Auth but has no tenant member record yet
    const userMetadata = userData?.user?.user_metadata || {};
    return NextResponse.json({
      id: userId,
      user_id: userId,
      tenant_id: tenantId,
      full_name: userMetadata.full_name || email.split("@")[0] || "Utsav User",
      phone: userMetadata.phone || "",
      avatar_url: userMetadata.avatar_url || "",
      email,
      role: "owner", // default role for creator
    });
  }

  return NextResponse.json({
    ...member,
    email,
  });
}

export async function PATCH(req: Request) {
  const { userId, error } = await verifySession(req);
  if (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ message: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      avatarUrl,
      city,
      state,
      dateOfBirth,
      skills,
      languages,
      emergencyContactName,
      emergencyContactPhone,
      notes,
      preferredLanguage,
      membershipType,
      dndStartTime,
      dndEndTime,
    } = body;

    const supabase = createServiceRoleClient();

    // Verify member exists or upsert it
    const { data: member, error: findError } = await supabase
      .from("tenant_members")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    const updates: Record<string, any> = {};
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (dateOfBirth !== undefined) updates.date_of_birth = dateOfBirth || null;
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills) ? skills : (skills ? [skills] : []);
    }
    if (languages !== undefined) {
      updates.languages = Array.isArray(languages) ? languages : (languages ? [languages] : ['en']);
    }
    if (emergencyContactName !== undefined) updates.emergency_contact_name = emergencyContactName || null;
    if (emergencyContactPhone !== undefined) updates.emergency_contact_phone = emergencyContactPhone || null;
    if (notes !== undefined) updates.notes = notes || null;
    if (preferredLanguage !== undefined) updates.preferred_language = preferredLanguage || 'en';
    if (membershipType !== undefined) updates.membership_type = membershipType || 'annual';
    if (dndStartTime !== undefined) updates.dnd_start_time = dndStartTime || null;
    if (dndEndTime !== undefined) updates.dnd_end_time = dndEndTime || null;

    if (avatarUrl !== undefined) {
      if (avatarUrl && avatarUrl.startsWith("data:image/")) {
        const matches = avatarUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const type = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          let ext = "jpg";
          if (type === "image/png") ext = "png";
          else if (type === "image/webp") ext = "webp";

          const filePath = `${tenantId}/${userId}/avatar_${Date.now()}.${ext}`;

          try {
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.some((b) => b.name === "avatars");
            if (!bucketExists) {
              await supabase.storage.createBucket("avatars", { public: true });
            }

            const { error: uploadError } = await supabase.storage
              .from("avatars")
              .upload(filePath, buffer, {
                contentType: type,
                upsert: true,
              });

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);
              updates.avatar_url = urlData.publicUrl;
            } else {
              console.error("Avatar upload failed:", uploadError);
              return NextResponse.json({ message: `Avatar upload failed: ${uploadError.message || uploadError}` }, { status: 400 });
            }
          } catch (storageErr: any) {
            console.error("Avatar storage operation failed:", storageErr);
            return NextResponse.json({ message: `Avatar storage operation failed: ${storageErr.message || storageErr}` }, { status: 500 });
          }
        } else {
          return NextResponse.json({ message: "Invalid base64 image data format" }, { status: 400 });
        }
      } else {
        // Normal URL or null
        updates.avatar_url = avatarUrl;
      }
    }

    let resultMember;

    if (!member) {
      // Create new tenant member row
      const { data: newMember, error: insertError } = await supabase
        .from("tenant_members")
        .insert({
          tenant_id: tenantId,
          user_id: userId,
          role: "owner", // Fallback to owner if they are the primary user updating their details
          status: "active",
          ...updates,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ message: insertError.message }, { status: 500 });
      }
      resultMember = newMember;
    } else {
      const { data: updatedMember, error: updateError } = await supabase
        .from("tenant_members")
        .update(updates)
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError || !updatedMember) {
        return NextResponse.json({ message: updateError?.message || "Failed to update member" }, { status: 500 });
      }
      resultMember = updatedMember;
    }

    // Update user metadata in Supabase Auth as well (very important for persistence)
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const updatedMetadata = {
      ...(userData?.user?.user_metadata || {}),
    };
    if (fullName !== undefined) updatedMetadata.full_name = fullName;
    if (phone !== undefined) updatedMetadata.phone = phone;
    if (updates.avatar_url !== undefined) updatedMetadata.avatar_url = updates.avatar_url;

    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata,
    });

    return NextResponse.json(resultMember);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
