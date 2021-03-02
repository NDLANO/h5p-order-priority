
const position = index => index + 1;

const positionLengthName = listDetails => ({
  ":startPosition": position(listDetails.index),
  ":listLength": listDetails.listSize,
  ":listName": listDetails.listName,
});

const startEndLength = (sourceDetails, destinationDetails) => ({
  ":startPosition": position(sourceDetails.index),
  ":endPosition": position(destinationDetails.index),
  ":listLength": sourceDetails.listSize,
});

const namesPositionName = (sourceDetails, destinationDetails) => ({
  ":sourceName": sourceDetails.listName,
  ":startPosition": position(sourceDetails.index),
  ":endPosition": position(destinationDetails.index),
  ":destinationName": destinationDetails.listName,
});

const namesPositionsLengths = (sourceDetails, destinationDetails) => ({
  ":startListName": sourceDetails.listName,
  ":startPosition": position(sourceDetails.index),
  ":startListLength": sourceDetails.listSize,
  ":destinationListName": destinationDetails.listName,
  ":destinationPosition": position(destinationDetails.index),
  ":destinationListLength": destinationDetails.listSize,
});

const Messages = {
  position,
  positionLengthName,
  startEndLength,
  namesPositionName,
  namesPositionsLengths,
};

export default Messages;
