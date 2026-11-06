import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

import { Badge, Button, Separator } from '~/components/ui'
import { navigate } from '../hooks'
import { inventory, inventoryCount } from '../inventory'
import { slugFor, usageBySlug, type UsageDoc } from '../usage'
import { componentGroups, components, findComponent, type ComponentDoc } from '../registry'
import { CodeTabs, Demo, PropsTable, Section } from '../showcase'
import styles from '../docs.module.scss'

export function ComponentsIndexPage() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Components</span>
        <h1 className={styles.heroTitle}>
          {inventoryCount} building blocks.
        </h1>
        <p className={styles.heroLead}>
          Small enough to read in one sitting, complete enough to ship a product
          surface. Table, form, overlay, navigation, chart and system layers all
          follow the same token and accessibility rules.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>
            <span className={styles.chipDot} />
            Typed variants
          </span>
          <span className={styles.chip}>SCSS Modules</span>
          <span className={styles.chip}>Ref-forwarding controls</span>
          <span className={styles.chip}>Reduced-motion aware</span>
        </div>
      </header>

      {componentGroups.map((group) => {
        const items = components.filter((component) => component.group === group)
        if (items.length === 0) return null

        return (
          <Section key={group} title={group} lead={`${items.length} component${items.length === 1 ? '' : 's'}`}>
            <div className={styles.componentGrid}>
              {items.map((component) => (
                <a
                  key={component.slug}
                  href={`#/components/${component.slug}`}
                  className={styles.componentCard}
                >
                  <span className={styles.componentTop}>
                    <span className={styles.componentName}>{component.name}</span>
                    <ArrowRight size={14} aria-hidden />
                  </span>
                  <p className={styles.componentDesc}>{component.description}</p>
                </a>
              ))}
            </div>
          </Section>
        )
      })}

      <Section
        title="Full inventory"
        lead="Everything in the kit, grouped by the job it does. Every item links to a usage page with import, dependency and SCSS tabs; the sixteen core components also include live demos and API tables."
      >
        <div className={styles.componentGrid}>
          {inventory
            .filter((category) => category.key !== 'core')
            .map((category) => (
              <a
                key={category.key}
                href={`#/${category.href}`}
                className={styles.componentCard}
              >
                <span className={styles.componentTop}>
                  <span className={styles.componentName}>{category.label}</span>
                  <span className={styles.componentCount}>
                    {category.items.length}
                  </span>
                </span>
                <p className={styles.componentDesc}>{category.description}</p>
              </a>
            ))}
        </div>

        <div className={styles.inventoryGroups}>
          {inventory.map((category) => (
            <div key={category.key} className={styles.inventoryGroup}>
              <div className={styles.inventoryHead}>
                <h3 className={styles.cardTitle}>{category.label}</h3>
                <a href={`#/${category.href}`} className={styles.backLink}>
                  Open
                  <ArrowRight aria-hidden />
                </a>
              </div>
              <div className={styles.chipRow}>
                {category.items.map((item) => (
                  <a key={item} href={`#/components/${slugFor(item)}`} className={styles.chip}>
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

export function ComponentDetailPage({ slug }: { slug: string }) {
  const component = findComponent(slug)

  if (!component) {
    const usage = usageBySlug.get(slug)
    if (usage) return <GenericComponentArticle usage={usage} />
    return (
      <Section title="Component not found" lead="That slug is not in the registry.">
        <Button onClick={() => navigate('components')}>Back to components</Button>
      </Section>
    )
  }

  return <ComponentArticle component={component} />
}

function GenericComponentArticle({ usage }: { usage: UsageDoc }) {
  const category = inventory.find((item) => item.label === usage.group)

  return (
    <>
      <header className={styles.detailHeader}>
        <a href="#/components" className={styles.backLink}>
          <ArrowLeft aria-hidden />
          All components
        </a>
        <h1 className={styles.detailTitle}>{usage.name}</h1>
        <p className={styles.detailLead}>{usage.description}</p>
        <div className={styles.detailMeta}>
          <Badge variant="outline">{usage.group}</Badge>
          <Badge variant="soft">SCSS Modules</Badge>
          <Badge variant="soft">Usage included</Badge>
        </div>
      </header>

      <Section title="Usage" lead="Copy the snippet, then adjust props and copy to your product.">
        <CodeTabs code={usage.code} name={usage.slug} />
      </Section>

      <Section title="Notes" lead="A few rules that keep the component predictable.">
        <div className={styles.checkList}>
          {usage.notes.map((note) => (
            <div key={note} className={styles.checkItem}>
              <span className={styles.checkIcon}>
                <Check aria-hidden />
              </span>
              <div className={styles.checkBody}>
                <p className={styles.checkText}>{note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {category ? (
        <Section title="More examples" lead="The category page carries a live preview and related components.">
          <Button variant="outline" onClick={() => navigate(category.href)}>
            Open {category.label}
            <ArrowRight aria-hidden />
          </Button>
        </Section>
      ) : null}

      <Separator />

      <div className={styles.footer}>
        <a href="#/components" className={styles.backLink}>
          <ArrowLeft aria-hidden />
          All components
        </a>
      </div>
    </>
  )
}

function ComponentArticle({ component }: { component: ComponentDoc }) {
  const index = components.findIndex((item) => item.slug === component.slug)
  const previous = components[index - 1]
  const next = components[index + 1]

  return (
    <>
      <header className={styles.detailHeader}>
        <a href="#/components" className={styles.backLink}>
          <ArrowLeft aria-hidden />
          All components
        </a>
        <h1 className={styles.detailTitle}>{component.name}</h1>
        <p className={styles.detailLead}>{component.description}</p>
        <div className={styles.detailMeta}>
          <Badge variant="outline">{component.group}</Badge>
          <Badge variant="soft">SCSS Modules</Badge>
          <Badge variant="soft">Ref-forwarding</Badge>
        </div>
      </header>

      <Section title="Preview" lead="Interactive — try the keyboard and the theme toggle.">
        <Demo title={component.name} note={`src/components/ui/${component.slug}`}>
          {component.demo}
        </Demo>
      </Section>

      <Section title="Usage" lead="Copy the snippet, then adjust copy and spacing to your product.">
        <CodeTabs code={component.code} name={component.slug} />
      </Section>

      <Section title="When to use it" lead="A few rules that keep the interface quiet and predictable.">
        <div className={styles.checkList}>
          {component.usage.map((rule) => (
            <div key={rule} className={styles.checkItem}>
              <span className={styles.checkIcon}>
                <Check aria-hidden />
              </span>
              <div className={styles.checkBody}>
                <p className={styles.checkText}>{rule}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="API" lead="Only the public surface is listed. Native attributes pass through.">
        <PropsTable rows={component.props} />
      </Section>

      <Separator />

      <div className={styles.footer}>
        {previous ? (
          <a href={`#/components/${previous.slug}`} className={styles.backLink}>
            <ArrowLeft aria-hidden />
            {previous.name}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={`#/components/${next.slug}`} className={styles.backLink}>
            {next.name}
            <ArrowRight aria-hidden />
          </a>
        ) : null}
      </div>
    </>
  )
}
