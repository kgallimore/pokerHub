#include <Arduino.h>

class ReadTags
{
public:
  unsigned long lastRead = 0;
  void reset()
  {
    tagId = "";
    lastRead = 0;
  }
  bool compareTags(String tag)
  {
    if (tag == tagId)
    {
      lastRead = millis();
      return true;
    }
    return false;
  }
  void setTag(String tag)
  {
    lastRead = millis();
    tagId = tag;
  }
  String getTag()
  {
    return tagId;
  }

private:
  String tagId = "";
};

