//offline data

db.enablePersistence().catch(err =>{
    if(err.code =='failed-precondition'){
        console.log('persistace failed');
        
    } else if(err.code == 'unimplemented'){
        console.log('persistace is not available');
        
    }
});


db.collection('recipes').onSnapshot((snapshot) => {
    // console.log(snapshot.docChanges());
    snapshot.docChanges().forEach(change => {
        // console.log(change.doc.data());
        if(change.type === 'added'){
            // add document to the UI
            renderRecipe(change.doc.data(), change.doc.id);
        }
        if(change.type === 'removed'){
            // remove the document data from the ui 
            removeRecipe(change.doc.id);

        }
        
    })
    
});


//add new recipes
const form = document.querySelector('form');
form.addEventListener('submit', evt => {
    evt.preventDefault();


    const recipe = {
        title: form.title.value,
        ingredients: form.ingredients.value
    }
    db.collection('recipes').add(recipe).catch(err => {
        console.log(err);
    })

    form.title.value = '';
    form.ingredients.value= '';
});

//deleting recipe


const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', evt =>{
    if(evt.target.tagName === 'I'){
        const id = evt.target.getAttribute('data-id');
        db.collection('recipes').doc(id).delete();
    }
    
})