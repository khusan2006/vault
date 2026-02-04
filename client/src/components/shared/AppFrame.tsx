"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Frame, Navigation, TopBar } from "@shopify/polaris";
import {
  HomeIcon,
  TargetIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";

interface AppFrameProps {
  children: React.ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const toggleMobileNavigationActive = useCallback(() => {
    setMobileNavigationActive((active) => !active);
  }, []);

  const handleNavigationItemClick = useCallback(
    (path: string) => {
      router.push(path);
      setMobileNavigationActive(false);
    },
    [router]
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      onNavigationToggle={toggleMobileNavigationActive}
    />
  );

  const navigationMarkup = (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          {
            url: "/",
            label: "Home",
            icon: HomeIcon,
            selected: pathname === "/",
            onClick: () => handleNavigationItemClick("/"),
          },
          {
            url: "/campaigns",
            label: "Campaigns",
            icon: TargetIcon,
            selected: pathname.startsWith("/campaigns"),
            onClick: () => handleNavigationItemClick("/campaigns"),
          },
          {
            url: "/settings",
            label: "Settings",
            icon: SettingsIcon,
            selected: pathname === "/settings",
            onClick: () => handleNavigationItemClick("/settings"),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigationActive}
    >
      {children}
    </Frame>
  );
}
