import { useQuery } from '@apollo/react-hooks'
import lodashOrderby from 'lodash.orderby'
import lodashUniqBy from 'lodash.uniqby'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { SelectItem } from 'components/form/SelectItem'
import { queryTopCategories } from 'queries/OMENCategories'
import { GetCategories } from 'types/generatedGQLForOMEN'
import { Remote } from 'util/remoteData'
import { capitalize } from 'util/tools'
import { Categories } from 'util/types'

const DropdownStyled = styled(Dropdown)`
  .dropdownItems {
    max-height: 200px;
    overflow: auto;
  }
`

interface Props {
  onClick: (value: string) => void
  value: Maybe<string>
}

interface CategoryItem {
  text: string
  onClick: () => void
  value: string
}

export const CategoriesDropdown = ({ onClick, value }: Props) => {
  const [categories, setCategories] = useState<Remote<CategoryItem[]>>(Remote.notAsked())

  const categoryItems: CategoryItem[] = useMemo(
    () => [
      {
        text: Categories.businessAndFinance,
        onClick: () => {
          onClick(Categories.businessAndFinance)
        },
        value: Categories.businessAndFinance,
      },
      {
        text: Categories.cryptocurrency,
        onClick: () => {
          onClick(Categories.cryptocurrency)
        },
        value: Categories.cryptocurrency,
      },
      {
        text: Categories.newsAndPolitics,
        onClick: () => {
          onClick(Categories.newsAndPolitics)
        },
        value: Categories.newsAndPolitics,
      },
      {
        text: Categories.scienceAndTech,
        onClick: () => {
          onClick(Categories.scienceAndTech)
        },
        value: Categories.scienceAndTech,
      },
      {
        text: Categories.sports,
        onClick: () => {
          onClick(Categories.sports)
        },
        value: Categories.sports,
      },
      {
        text: Categories.weather,
        onClick: () => {
          onClick(Categories.weather)
        },
        value: Categories.weather,
      },
      {
        text: Categories.miscellaneous,
        onClick: () => {
          onClick(Categories.miscellaneous)
        },
        value: Categories.miscellaneous,
      },
    ],
    [onClick]
  )

  const { data: categoriesFromOmen, error: categoriesError, loading: categoriesLoading } = useQuery<
    GetCategories
  >(queryTopCategories, {
    context: { clientName: 'Omen' },
    variables: {
      first: 100,
    },
  })

  useEffect(() => {
    if (categoriesLoading) {
      setCategories(Remote.loading())
    } else if (categoriesFromOmen) {
      const { categories } = categoriesFromOmen
      // First we get unique categories
      const newCategories = lodashUniqBy(
        [
          ...categories.map((category) => {
            const valueCapitalized = capitalize(category.id)
            return {
              text: valueCapitalized,
              onClick: () => {
                onClick(valueCapitalized)
              },
              value: valueCapitalized,
            }
          }),
          ...categoryItems,
        ],
        'text'
      )

      // Second we order categories by text asc
      setCategories(Remote.success(lodashOrderby(newCategories, ['text'], ['asc'])))
    } else if (categoriesError) {
      setCategories(Remote.success(categoryItems))
    }
  }, [categoriesFromOmen, categoriesLoading, categoriesError, categoryItems, onClick])

  useEffect(() => {
    if (!value && categories.isSuccess() && categories.hasData()) {
      const categoriesData = categories.get()
      if (categoriesData.length > 0) categoriesData[0].onClick()
    }
  }, [categories, value])

  const currentItem = useMemo(() => {
    let currentItem = 0
    if (categories.hasData()) {
      currentItem = categories.get().findIndex((category) => category.value === value)
    }
    return currentItem
  }, [value, categories])

  return (
    categories && (
      <DropdownStyled
        currentItem={currentItem}
        disabled={!(categories.isSuccess() && categories.hasData())}
        dropdownButtonContent={
          <ButtonSelect
            content={
              categories.isSuccess() && categories.hasData()
                ? categories.get().filter((item, index) => {
                    if (value) {
                      return item.value === value
                    } else {
                      return index === 0
                    }
                  })[0].text
                : 'Loading...'
            }
          />
        }
        dropdownPosition={DropdownPosition.center}
        fullWidth
        items={
          categories.isSuccess() && categories.hasData()
            ? categories
                .get()
                .map((item, index) => (
                  <SelectItem
                    content={item.text}
                    key={index}
                    name="category"
                    onClick={item.onClick}
                    value={item.value.toString()}
                  />
                ))
            : []
        }
      />
    )
  )
}
