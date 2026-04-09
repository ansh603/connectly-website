/**
 * Merge API auth payload into the shape the UI expects (MOCK_USER-compatible).
 */
export function mapAuthUserToAppUser(apiData = {}, mockSeed = {}) {
  const interestList = Array.isArray(apiData.interests) ? apiData.interests : [];
  const interestIds =
    interestList.length > 0 && typeof interestList[0] === "object" && interestList[0]?.id
      ? interestList.map((x) => x.id).filter(Boolean)
      : mockSeed.interestIds ?? [];

  const interestNames =
    interestList.length > 0
      ? typeof interestList[0] === "object"
        ? interestList.map((x) => x.name).filter(Boolean)
        : interestList.filter((x) => typeof x === "string")
      : mockSeed.interests;

  return {
    ...mockSeed,
    id: apiData.id ?? mockSeed.id,
    name: apiData.name ?? mockSeed.name,
    email: apiData.email ?? mockSeed.email,
    mobile: [apiData.country_code, apiData.phone_number].filter(Boolean).join(" ").trim() || mockSeed.mobile,
    location: apiData.location || apiData.city?.name || mockSeed.location,
    city_id: apiData.city_id ?? mockSeed.city_id,
    bio: apiData.bio ?? mockSeed.bio,
    hourlyRate:
      apiData.rate != null && apiData.rate !== ""
        ? Number(apiData.rate)
        : mockSeed.hourlyRate,
    availability: apiData.availability ?? mockSeed.availability,
    interests: interestNames?.length ? interestNames : mockSeed.interests,
    interestIds: interestIds?.length ? interestIds : mockSeed.interestIds ?? [],
    type: "individual",
    photo: mockSeed.photo,
    galleryPhotos: mockSeed.galleryPhotos ?? [],
    // Keep both fields: some UI checks `verified`, others check `is_verified`.
    is_verified: apiData.is_verified === true,
    verified: apiData.is_verified === true || mockSeed.verified,
  };
}
