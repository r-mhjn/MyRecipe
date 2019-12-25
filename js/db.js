// real-time listner, it listens to the recipies colletion if there is a change in the colletion it sends us a snapshot of that collection
db.collection("recipes").onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    // console.log(change, change.doc.data(), change.doc.id);
    if (change.type === "added") {
      // add the document data to the web page
      renderRecipe(change.doc.data(), change.doc.id);
    }
    if (change.type === "removed") {
      // remove the document data from the web page
    }
  });
});
