import React, { useEffect, useMemo } from "react"
import { graphql } from "gatsby"
import {
  Paper,
  Headline,
  Textline,
  Actions,
  Title,
  Hero,
  Wrapper,
  Overlay,
  LinkButton,
} from "../components/style"
import { SEO } from "../components/seo"
import { Form, FormBlock } from "../blocks/form"
import { Content, ContentBlock } from "../blocks/content"
import { Context } from "../components/context"

import { useJsonForm } from "gatsby-tinacms-json"

function Page(props) {
  const [page] = useJsonForm(props.data.page, PageForm)
  const [nav] = useJsonForm(props.data.nav, NavForm)

  const blocks = page.blocks ? page.blocks : []

  const siteContext = React.useContext(Context)

  useEffect(() => siteContext.setPageTheme(page.pageTheme), [page.pageTheme])

  return (
    <Context.Consumer>
      {({ theme }) => (
        <>
          <SEO title={page.title} />
          <Hero>
            <Wrapper>
              {page.hero && page.hero.headline && (
                <Headline>{page.hero.headline}</Headline>
              )}
              {page.hero && page.hero.textline && (
                <Textline>{page.hero.textline}</Textline>
              )}
              {page.hero && page.hero.ctas.length > 0 && (
                <Actions>
                  {page.hero.ctas.map(cta => {
                    return (
                      <LinkButton primary={cta.primary} to={cta.link}>
                        {cta.label}
                      </LinkButton>
                    )
                  })}
                </Actions>
              )}
            </Wrapper>
            <Overlay />
          </Hero>
          <Wrapper>
            <Paper>
              {theme.page.displayTitle && (
                <>
                  <Title>{page.title}</Title>
                  <hr />
                </>
              )}
              {blocks &&
                blocks.map(({ _template, ...data }, i) => {
                  switch (_template) {
                    case "FormBlock":
                      return <Form form={data} />
                    case "ContentBlock":
                      if (data.content)
                        return (
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                page.childrenPagesJsonBlockMarkdown[i]
                                  .childMarkdownRemark.html,
                            }}
                          ></div>
                        )
                      break
                    default:
                      return true
                  }
                })}
            </Paper>
          </Wrapper>
        </>
      )}
    </Context.Consumer>
  )
}

const NavForm = {
  label: "Main Menu",
  fields: [
    {
      label: "Main Menu",
      name: "rawJson.menuItems",
      component: "group-list",
      itemProps: item => ({
        key: item.link,
        label: item.label,
      }),
      fields: [
        {
          label: "Label",
          name: "label",
          component: "text",
        },
        {
          label: "Link",
          name: "link",
          component: "text",
        },
        {
          label: "Sub Menu",
          name: "subMenu",
          component: "group-list",
          itemProps: item => ({
            key: item.link,
            label: item.label,
          }),
          fields: [
            {
              label: "Label",
              name: "label",
              component: "text",
            },
            {
              label: "Link",
              name: "link",
              component: "text",
            },
            {
              label: "Sub Menu",
              name: "subMenu",
              component: "group-list",
              itemProps: item => ({
                key: item.link,
                label: item.label,
              }),
              fields: [
                {
                  label: "Label",
                  name: "label",
                  component: "text",
                },
                {
                  label: "Link",
                  name: "link",
                  component: "text",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const PageForm = {
  label: "Page",
  fields: [
    {
      label: "Title",
      name: "rawJson.title",
      component: "text",
    },
    {
      label: "Hero",
      name: "rawJson.hero",
      component: "group",
      fields: [
        {
          label: "Headline",
          name: "headline",
          component: "text",
        },
        {
          label: "Textline",
          name: "textline",
          component: "text",
        },
        {
          label: "Actions",
          name: "ctas",
          component: "group-list",
          fields: [
            {
              label: "Label",
              name: "label",
              component: "text",
            },
            {
              label: "Link",
              name: "link",
              component: "text",
            },
            {
              label: "Primary",
              name: "primary",
              component: "toggle",
            },
            {
              label: "Arrow",
              name: "arrow",
              component: "toggle",
            },
          ],
        },
      ],
    },
    {
      label: "Page Sections",
      name: "rawJson.blocks",
      component: "blocks",
      templates: {
        FormBlock,
        ContentBlock,
      },
    },
    {
      label: "Page Theme",
      name: "rawJson.pageTheme",
      component: "group",
      fields: [
        {
          label: "Uppercase H2",
          name: "typography.uppercaseH2",
          component: "toggle",
        },
        {
          label: "Page Headline",
          name: "page.displayHeadline",
          component: "toggle",
        },
        {
          label: "Page Title",
          name: "page.displayTitle",
          component: "toggle",
        },
      ],
    },
  ],
}

export default Page

export const pageQuery = graphql`
  query($path: String!) {
    page: pagesJson(path: { eq: $path }) {
      title
      content
      hero {
        headline
        textline
        background
        ctas {
          label
          link
          primary
        }
      }
      blocks {
        _template
        content
        name
        recipient
        fields {
          label
          inputType
          autocomplete
        }
      }
      childrenPagesJsonBlockMarkdown {
        childMarkdownRemark {
          html
        }
      }

      ...pageTheme

      rawJson
      fileRelativePath
    }
    nav: dataJson(fileRelativePath: { eq: "/data/menu.json" }) {
      menuItems {
        link
        label
      }

      rawJson
      fileRelativePath
    }
  }
`
