import createSchema from 'part:@sanity/base/schema-creator'
import schemaTypes from 'all:part:@sanity/base/schema-type'

export default createSchema({
  
  name: 'ColorContrastSite',
  types: schemaTypes.concat([
    {
      title: "Owner",
      name: "owner",
      type: "document",
      fields: [
        {
          title: "Name",
          name: "name",
          type: "string",
        }
      ]
    },

    {
      title: 'Color Palette',
      name: 'palette',
      type: 'document',
      fields: [
        {
          title: 'Title',
          name: 'title',
          type: 'string'
        },    
        {
          title: 'Owner',
          name: 'owner',
          type: 'reference',
          to: [{type: 'owner'}]
        }
      ]
    },

    {
      title: 'Color',
      name: 'color',
      type: 'document',
      fields: [
        {
          title: 'Name',
          name: 'name',
          type: 'string'
        },
        {
          title: 'Value',
          name: 'value',
          type: 'string'
        },
        {
          title: 'Palette',
          name: 'palette',
          type: 'reference',
          to: [{type: 'palette'}]
        }
      ]
    }
  ])
})
