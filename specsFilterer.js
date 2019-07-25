var fs = require('fs');

JSON_FILENAME = 'products.json'

class SpecsFilterer {
    constructor() {
        var rawContent = fs.readFileSync(JSON_FILENAME);
        this.products = JSON.parse(rawContent);
        
        this.selectedProducts = [];
    }

    async filterSpecs(specs) {
        var indices = this.getFilterIndices(specs);

        var uniqueIndices = indices[0];
        for (var i=1; i < indices.length; i++) {
            uniqueIndices = uniqueIndices.filter(x => indices[i].includes(x));
        }
    
        var filteredProducts = Array.from(uniqueIndices, i => this.products[i]);

        console.log(`Found ${filteredProducts.length} products.`);
        this.selectedProducts = filteredProducts;
    }

    getFilterIndices(specs) {
        var filters = [];
        for (let key in specs) {
            let value = specs[key];

            switch (key) {
                case 'Price':
                    filters.push(this.filterPrice(value));
                    break;
                case 'Color/Finish':
                    filters.push(this.filterColorFinish(value));
                    break;
                case 'Energy Star':
                    filters.push(this.filterEnergyStar(value));
                    break;
                case 'Capacity':
                    filters.push(this.filterFreezerCapacity(value));
                    break;
                case 'Water Filtration':
                    filters.push(this.filterWaterFiltration(value));
                    break;
                case 'Depth Type':
                    filters.push(this.filterDepthType(value));
                    break;
                case 'Warranty':
                    filters.push(this.filterWarranty(value));
                    break;
                default:
                    throw `Unexpected key: ${key}`;
            }
        }
        
        return filters;
    }
        
    filterPrice(choice) {
        var indexes = []
        for (let i=0; i < this.products.length; i++) {
            let prodValue = this.products[i]['price'];
            if (choice === 'Less than $500' && prodValue < 500.0) {
                indexes.push(i)
            } else if (choice === '$500-$1000' && prodValue >= 500.0 && prodValue < 1000.0) {
                indexes.push(i)
            } else if (choice === '$1000-$2000' && prodValue >= 1000.0 && prodValue < 2000.0) {
                indexes.push(i)
            } else if (choice === '$2000-$4000' && prodValue >= 2000.0 && prodValue < 4000.0) {
                indexes.push(i)
            } else if (choice === '$4000+' && prodValue >= 4000.0) {
                indexes.push(i)
            }
        }

        return indexes;
    }

    filterColorFinish(value) {
        var indexes = []
        for (let i=0; i < this.products.length; i++) {
            let prodValue = this.products[i]['appliancecolorfinish'];
            
            indexes.push(i);
        }

        return indexes;
    }

    filterEnergyStar(value) {
        var indexes = []
        for (let i=0; i < this.products.length; i++) {
            let prodValue = this.products[i]['energystarcertified'];
            if (value === 'Yes' && prodValue == value) {
                indexes.push(i);
            } else if (value === 'No' && prodValue == value) {
                indexes.push(i);
            }
        }

        return indexes;
    }

    filterFreezerCapacity(value) {
        var indexes = []
        for (let i=0; i < this.products.length; i++) {
            let prodValue = this.products[i]['freezercapacitycufeet'];

            indexes.push(i);
        }

        return indexes;
    }

    filterWaterFiltration(value) {
        var indexes = []
        for (let i=0; i < this.products.length; i++) {
            let prodValue = this.products[i]['waterfiltration'];

            indexes.push(i);
        }

        return indexes;
    }

    filterDepthType(value) {
        var indexes = []
        for (let i=0; i < this.products.length; i++) {
            let prodValue = this.products[i]['depthtype'];

            indexes.push(i);
        }

        return indexes;
    }

    filterWarranty(value) {
        var indexes = []
        for (let i=0; i < this.products.length; i++) {
            let prodValue = this.products[i]['warranty'];

            indexes.push(i);
        }

        return indexes;
    }
}

module.exports.SpecsFilterer = SpecsFilterer;