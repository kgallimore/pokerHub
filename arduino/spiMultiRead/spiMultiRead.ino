#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>

#define NUMBER_READERS 2

class ReadTags {
public:
  String tagId = "";
  int missedReads = 0;
  void reset() {
    tagId = "";
    missedReads = 0;
  }
  bool missedRead(){
    if(tagId == ""){
      return false;
    }
    if(missedReads == 4){
      reset();
      return true;
    }
    missedReads++;
    return false;
  }
  bool compareTags(String tag){
    if(tag == tagId){
      missedReads = 0;
      return true;
    }
    return false;
  }
};

class Sensor {
public:
  ReadTags tags[2] = { ReadTags(), ReadTags() };
  bool cardPresent() {
    return tags[0].tagId != "" || tags[1].tagId != "";
  }
  bool readCard(String tagId) {
    bool sendUpdate = false;
    if (tagId == "") {
      for (int i = 0; i < 2; i++) {
        if (tags[i].missedRead()) {
          sendUpdate = true;
        }
      }
    }else if(tags[0].compareTags(tagId)){
        sendUpdate = tags[1].missedRead();
      }else if(tags[1].compareTags(tagId)){
        sendUpdate = tags[0].missedRead();
      } else if(tags[0].tagId == ""){
        tags[0].tagId = tagId;
        sendUpdate = true;
      } else if(tags[1].tagId == ""){
        tags[1].tagId = tagId;
        sendUpdate = true;
      }
    
    return sendUpdate;
  }
  String getComm() {
    return "[\"" + tags[0].tagId + "\",\"" + tags[1].tagId + "\"]";
  }
};



PN532_SPI interface(SPI, 9);
PN532_SPI interface2(SPI, 10);

NfcAdapter nfc[NUMBER_READERS] = { NfcAdapter(interface), NfcAdapter(interface2) };
String tagIds[NUMBER_READERS] = { "", "" };
Sensor sensors[NUMBER_READERS] = { Sensor(), Sensor() };




void setup(void) {
  Serial.begin(115200);
  while (!Serial) {
    ;
  }
  Serial.println(NUMBER_READERS);
  for (int i = 0; i < NUMBER_READERS; i++) {
    nfc[i].begin();
  }
}

void loop() {
  if (Serial.available() > 0) {
    String incomingString = Serial.readString();
    incomingString.trim();
    if (incomingString == "resync") {
      Serial.println(NUMBER_READERS);
      for (int i = 0; i < NUMBER_READERS; i++) {
        Serial.println(String(i) + ":" + tagIds[i]);
      }
    } else {
      Serial.println(incomingString);
    }
  }
  readNFC();
}

void readNFC() {
  for (int i = 0; i < NUMBER_READERS; i++) {
    if (nfc[i].tagPresent(50)) {
      NfcTag tag = nfc[i].read();
      String newTag = tag.getUidString();
      if (sensors[i].readCard(newTag)) {
        Serial.println(String(i) + ":" + sensors[i].getComm());
      }
    } else if (sensors[i].cardPresent()) {
      if (sensors[i].readCard("")) {
        Serial.println(String(i) + ":" + sensors[i].getComm());
      }
    }
  }
}