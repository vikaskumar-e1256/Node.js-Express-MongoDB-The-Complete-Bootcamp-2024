class APIFeatures
{
    constructor(query, queryParams)
    {
        this.query = query;
        this.queryParams = queryParams;
    }

    filter()
    {
        const queryObj = Object.assign({}, this.queryParams);
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 2.) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this; // Entire Object
    }

    sort()
    {
        if (this.queryParams.sort)
        {
            const sortBy = this.queryParams.sort.split(',').join(' ');
            this.query = this.this.sort(sortBy);
        } else
        {
            this.query = this.query.sort('-createdAt'); // - means in desc order
        }
        return this; // Entire Object
    }

    limitFields()
    {
        if (this.queryParams.fields)
        {
            const selectFields = this.queryParams.fields.split(',').join(' ');
            this.query = this.query.select(selectFields);
        } else
        {
            this.query = this.query.select('-__v'); // - means we are excluding __v from the response
        }
        return this; // Entire Object
    }

    paginate()
    {
        const page = this.queryParams.page * 1 || 1;
        const limit = this.queryParams.limit * 1 || 10;
        const skip = (page - 1) * limit; // formula
        this.query = this.query.skip(skip).limit(limit);

        return this; // Entire Object
    }
}

module.exports = APIFeatures;
