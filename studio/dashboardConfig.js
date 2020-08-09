export default {
  widgets: [
    {
      name: 'sanity-tutorials',
      options: {
        templateRepoId: 'sanity-io/sanity-template-gatsby-blog'
      }
    },
    {name: 'structure-menu'},
    {
      name: 'project-info',
      options: {
        __experimental_before: [
          {
            name: 'netlify',
            options: {
              description:
                'NOTE: Because these sites are static builds, they need to be re-deployed to see the changes when documents are published.',
              sites: [
                {
                  buildHookId: '5f2f76d517794bdda166acf0',
                  title: 'Sanity Studio',
                  name: 'color-contrast-site-studio',
                  apiId: 'bc696ade-b890-4c32-8356-f626bc5de43a'
                },
                {
                  buildHookId: '5f2f76d5fe2951cb93573b4a',
                  title: 'Blog Website',
                  name: 'color-contrast-site',
                  apiId: '24ace842-aa6c-402f-a3c7-95796076e85b'
                }
              ]
            }
          }
        ],
        data: [
          {
            title: 'GitHub repo',
            value: 'https://github.com/ryanfiller/color-contrast-site',
            category: 'Code'
          },
          {title: 'Frontend', value: 'https://color-contrast-site.netlify.app', category: 'apps'}
        ]
      }
    },
    {name: 'project-users', layout: {height: 'auto'}},
    {
      name: 'document-list',
      options: {title: 'Recent blog posts', order: '_createdAt desc', types: ['post']},
      layout: {width: 'medium'}
    }
  ]
}
