// offline data
db.enablePersistence().catch(err => {
  if (err.code == "failed-precondition") {
    // multiple tabs open at once
    console.log("persistence failed");
  } else if (err.code == "unimplemented") {
    // lack of browser support
    console.log("persistence is not available");
  }
});

// real-time listner, it listens to the recipies colletion if there is a change in the colletion it sends us a snapshot of that collection
db.collection("recipes").onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    console.log(change, change.doc.data(), change.doc.id);
    if (change.type === "added") {
      // add the document data to the web page
      renderRecipe(change.doc.data(), change.doc.id);
    }
    if (change.type === "removed") {
      // remove the document data from the web page
      removeRecipe(change.doc.id);
    }
  });
});

// add new recipe
const form = document.querySelector("form");
form.addEventListener("submit", event => {
  event.preventDefault();

  const newRecipe = {
    title: form.title.value,
    ingredients: form.ingredients.value
  };

  db.collection("recipes")
    .add(newRecipe)
    .then(() => {
      console.log("recipe saved");
    })
    .catch(err => console.log(err));
  form.title.value = "";
  form.ingredients.value = "";
});

// delete a recipe
const recipeContainer = document.querySelector(".recipes");
recipeContainer.addEventListener("click", event => {
  if (event.target.innerHTML === "delete_outline") {
    const id = event.target.getAttribute("data-id");
    db.collection("recipes")
      .doc(id)
      .delete();
  }
});
