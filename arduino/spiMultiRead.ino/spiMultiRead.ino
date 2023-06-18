#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>

#define NUMBER_READERS 2

PN532_SPI interface(SPI, 9);
PN532_SPI interface2(SPI, 10);

NfcAdapter nfc[NUMBER_READERS] = { NfcAdapter(interface), NfcAdapter(interface2) };
String tagIds[NUMBER_READERS] = { "", "" };

void setup(void) {
  Serial.begin(115200);
  while (!Serial) {
    ;
  }
  for (int i = 0; i < NUMBER_READERS; i++) {
    nfc[i].begin();
  }
}

void loop() {
  readNFC();
}

void readNFC() {
  for (int i = 0; i < NUMBER_READERS; i++) {
    if (nfc[i].tagPresent(50)) {
      NfcTag tag = nfc[i].read();
      String newTag = tag.getUidString();
      if (newTag != tagIds[i]) {
        tagIds[i] = newTag;
        Serial.println(String(i) + ":" + newTag);
      }
    } else if (tagIds[i] != "") {
      Serial.println(String(i) + ":");
      tagIds[i] = "";
    }
  }
}