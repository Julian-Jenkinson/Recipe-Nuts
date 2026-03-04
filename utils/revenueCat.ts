
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

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

export type RevenueCatPaywallOutcome =
  | 'purchased'
  | 'restored'
  | 'cancelled'
  | 'not_presented'
  | 'error';

export const presentRevenueCatPaywall = async (
  offeringId: string
): Promise<RevenueCatPaywallOutcome> => {
  try {
    const offerings = await Purchases.getOfferings();
    const offering =
      offerings.all[offeringId] ??
      Object.values(offerings.all).find((o) => o.identifier === offeringId);

    if (!offering) {
      console.warn(
        `[RevenueCat] Offering "${offeringId}" not found. Available offerings: ${Object.keys(
          offerings.all
        ).join(', ')}`
      );
      return 'not_presented';
    }

    console.log(
      `[RevenueCat] Presenting paywall for offering "${offering.identifier}" with ${offering.availablePackages.length} package(s).`
    );

    const result = await RevenueCatUI.presentPaywall({ offering });
    console.log(`[RevenueCat] Paywall result: ${result}`);

    if (result === PAYWALL_RESULT.PURCHASED) return 'purchased';
    if (result === PAYWALL_RESULT.RESTORED) return 'restored';
    if (result === PAYWALL_RESULT.CANCELLED) return 'cancelled';
    if (result === PAYWALL_RESULT.NOT_PRESENTED) return 'not_presented';

    return 'error';
  } catch (err) {
    console.warn('[RevenueCat] Failed to present paywall:', err);
    return 'error';
  }
};
