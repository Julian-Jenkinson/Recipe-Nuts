
import Purchases from 'react-native-purchases';

export const fetchPaywallPackage = async (paywallId: string) => {
  try {
    const offerings = await Purchases.getOfferings();
    const paywall = Object.values(offerings.all).find(
      (o) => o.identifier === paywallId
    );
    if (paywall && paywall.availablePackages.length > 0) {
      return paywall.availablePackages[0];
    }
  } catch (err) {
    console.log("Error fetching paywall:", err);
  }
  return null;
};

export const purchasePackage = async (pkg: any) => {
  try {
    return await Purchases.purchasePackage(pkg);
  } catch (e) {
    throw e;
  }
};

