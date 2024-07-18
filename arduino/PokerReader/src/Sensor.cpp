#include <Arduino.h>
#include "ReadTags.cpp"

class Sensor
{
public:
  ReadTags tags[2] = {ReadTags(), ReadTags()};
  Sensor(int expectedNumCards, int cardReadTimeout)
  {
    _cardReadTimeout = cardReadTimeout;
    _expectedNumCards = expectedNumCards;
  }
  bool cardPresent()
  {
    return tags[0].lastRead != 0 || tags[1].lastRead != 0;
  }
  bool readCard(String tagId)
  {
    if (tagId == "")
    {
      if (!cardPresent())
      {
        return false;
      }
      for (int i = 0; i < _expectedNumCards; i++)
      {
        if ((tags[i].lastRead + _cardReadTimeout * 1000) >= millis())
        {
          return false;
        }
      }
      for (int i = 0; i < _expectedNumCards; i++)
      {
        tags[i].reset();
      }
      return true;
    }
    int lowestRead = tags[0].lastRead;
    int lowestReadInt = 0;
    for (int i = 0; i < _expectedNumCards; i++)
    {
      if (tags[i].getTag() == tagId)
      {
        return false;
      }
      if (tags[i].lastRead < lowestRead)
      {
        lowestRead = tags[i].lastRead;
        lowestReadInt = i;
      }
    }

    tags[lowestReadInt].setTag(tagId);

    return true;
  }
  String getComm()
  {
    String buildStr = "[\"";
    for (int i = 0; i < _expectedNumCards; i++)
    {
      if (i != 0)
      {
        buildStr += ",\"";
      }
      buildStr += tags[i].getTag();
      buildStr += "\"";
    }
    buildStr += "]";
    return buildStr;
  }

private:
  int _expectedNumCards = 1;
  int _cardReadTimeout = 10;
};
