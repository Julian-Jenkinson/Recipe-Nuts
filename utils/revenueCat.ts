
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Platform } from 'react-native';

type RevenueCatErrorLike = {
  code?: string;
  message?: string;
  userInfo?: unknown;
  underlyingErrorMessage?: string;
};

function serializeRevenueCatError(err: unknown) {
  if (err instanceof Error) {
    const errorWithExtras = err as Error & RevenueCatErrorLike;
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: errorWithExtras.code,
      userInfo: errorWithExtras.userInfo,
      underlyingErrorMessage: errorWithExtras.underlyingErrorMessage,
    };
  }

  if (typeof err === 'object' && err !== null) {
    const errorLike = err as RevenueCatErrorLike;
    return {
      code: errorLike.code,
      message: errorLike.message,
      userInfo: errorLike.userInfo,
      underlyingErrorMessage: errorLike.underlyingErrorMessage,
      raw: err,
    };
  }

  return { raw: err };
}

let configurePurchasesPromise: Promise<void> | null = null;

function getRevenueCatApiKey() {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;
  }

  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  }

  return null;
}

export async function ensureRevenueCatConfigured() {
  if (configurePurchasesPromise) {
    return configurePurchasesPromise;
  }

  configurePurchasesPromise = (async () => {
    const apiKey = getRevenueCatApiKey();

    if (!apiKey) {
      throw new Error(
        `[RevenueCat] Missing API key for platform "${Platform.OS}".`
      );
    }

    Purchases.configure({ apiKey });
    console.log(`[RevenueCat] Purchases configured for ${Platform.OS}.`);
  })().catch((err) => {
    configurePurchasesPromise = null;
    throw err;
  });

  return configurePurchasesPromise;
}

export const fetchPaywallPackage = async (paywallId: string) => {
  try {
    await ensureRevenueCatConfigured();
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
    await ensureRevenueCatConfigured();
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
    await ensureRevenueCatConfigured();
    const offerings = await Purchases.getOfferings();
    console.log(
      `[RevenueCat] Loaded offerings: ${Object.keys(offerings.all).join(', ')}`
    );

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

    console.warn('[RevenueCat] Paywall returned an unexpected result:', result);
    return 'error';
  } catch (err) {
    console.warn(
      '[RevenueCat] Failed to present paywall:',
      JSON.stringify(serializeRevenueCatError(err), null, 2)
    );
    return 'error';
  }
};
