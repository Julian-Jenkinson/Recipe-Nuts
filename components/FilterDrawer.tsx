import { Button, ButtonText } from "@/components/ui/button";
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import React from "react";
	
function App() {
          const [showDrawer, setShowDrawer] = React.useState(false);
          return (
            <>
              <Button
                onPress={() => {
                  setShowDrawer(true);
                }}
              >
                <ButtonText>Show Drawer</ButtonText>
              </Button>
              <Drawer
                isOpen={showDrawer}
                onClose={() => {
                  setShowDrawer(false);
                }}
                size="lg" anchor="bottom" 
              >
                <DrawerBackdrop />
                <DrawerContent>
                  <DrawerHeader>
                    <Heading size="3xl">Heading</Heading>
                  </DrawerHeader>
                  <DrawerBody>
                    <Text size="2xl" className="text-typography-800">
                      This is a sentence.
                    </Text>
                  </DrawerBody>
                  <DrawerFooter>
                    <Button
                      onPress={() => {
                        setShowDrawer(false);
                      }}
                      className="flex-1"
                    >
                      <ButtonText>Button</ButtonText>
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </>
          );
        };