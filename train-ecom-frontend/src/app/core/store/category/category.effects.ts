import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CategoryService } from "../../services/category.service";
import { Store } from "@ngrx/store";
import * as CategoryActions from "./category.action";
import { withLatestFrom } from "rxjs/internal/operators/withLatestFrom";
import { selectAllCategories } from "./category.selectors";
import { filter } from "rxjs/internal/operators/filter";
import { map } from "rxjs/internal/operators/map";
import { catchError } from "rxjs/internal/operators/catchError";
import { of } from "rxjs/internal/observable/of";
import { exhaustMap } from "rxjs/internal/operators/exhaustMap";





@Injectable()
export class CategoryEffects{
    private actions$ = inject(Actions);
    private store = inject(Store);
    private categoryService = inject(CategoryService);


    loadCategories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CategoryActions.loadCategories),
            withLatestFrom(this.store.select(selectAllCategories)),
            filter(([_, categories]) => !categories || categories.length === 0),
            exhaustMap(() =>
                this.categoryService.getAllCategories().pipe(
                    map((categories) => CategoryActions.loadCategoriesSuccess({ categories: categories || [] })),
                    catchError((error) =>
                        of(CategoryActions.loadCategoriesFailure({ error: error?.message || 'Failed to load categories' }))
                    )
                )
            )
        )
    )

}