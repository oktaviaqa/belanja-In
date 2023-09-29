function rupiahFormat(value){
    return (value).toLocaleString('ID',{style:'currency',currency:'IDR'})
}

module.exports = rupiahFormat