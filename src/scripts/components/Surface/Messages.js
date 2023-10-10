
const position = (index) => index + 1;

const positionLengthName = (listDetails) => ({
  ':startPosition': listDetails.startPosition,
  ':listLength': listDetails.listSize,
  ':listName': listDetails.listName,
});

const startEndLength = (sourceDetails, destinationDetails) => ({
  ':startPosition': sourceDetails.startPosition,
  ':endPosition': destinationDetails.destinationPosition,
  ':listLength': sourceDetails.listSize,
});

const namesPositionName = (sourceDetails, destinationDetails) => ({
  ':sourceName': sourceDetails.listName,
  ':startPosition': sourceDetails.startPosition,
  ':endPosition': destinationDetails.destinationPosition,
  ':destinationName': destinationDetails.listName,
});

const namesPositionsLengths = (sourceDetails, destinationDetails) => ({
  ':startListName': sourceDetails.listName,
  ':startPosition': sourceDetails.startPosition,
  ':startListLength': sourceDetails.listSize,
  ':destinationListName': destinationDetails.listName,
  ':destinationPosition': destinationDetails.destinationPosition,
  ':destinationListLength': destinationDetails.listSize,
});

const Messages = {
  position,
  positionLengthName,
  startEndLength,
  namesPositionName,
  namesPositionsLengths,
};

export default Messages;
