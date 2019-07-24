class SpecsFilterer {
    constructor() {
        console.log('Created SpecsFilterer!');
    }

    async filterSpecs(specs) {
        var filters = [];
        for (let key in specs) {
            let value = specs[key];
            console.log(`${key}: ${value}`);

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
                    filters.push(this.filterCapacity(value));
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
        console.log(filters);
        this.filters = filters;
    }
        
    async filterPrice(value) {
        return value;
    }

    async filterColorFinish(value) {
        return value;
    }

    async filterEnergyStar(value) {
        return value;
    }

    async filterCapacity(value) {
        return value;
    }

    async filterWaterFiltration(value) {
        return value;
    }

    async filterDepthType(value) {
        return value;
    }

    async filterWarranty(value) {
        return value;
    }
}

module.exports.SpecsFilterer = SpecsFilterer;