import { prisma } from "@/lib/db";
import { InitiativeCategory, Prisma } from "@prisma/client";

export interface CategoryCard {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  icon?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  isActive: boolean;
  _count?: {
    initiatives: number;
  };
}

// Category CRUD Operations
export class CategoryService {
  static API_PATH = "/categories";
  // Get all active categories
  static async getAll(): Promise<CategoryCard[]> {
    try {
      const categories = await prisma.initiativeCategory.findMany({
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              initiatives: {
                where: {
                  status: "published",
                },
              },
            },
          },
        },
        orderBy: {
          nameAr: "asc",
        },
      });

      return categories.map((category) => ({
        id: category.id,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        bgColor: category.bgColor,
        textColor: category.textColor,
        isActive: category.isActive,
        _count: {
          initiatives: category._count.initiatives,
        },
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  // Get single category by ID
  static async getById(id: string): Promise<CategoryCard | null> {
    try {
      const category = await prisma.initiativeCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              initiatives: {
                where: {
                  status: "published",
                },
              },
            },
          },
        },
      });

      if (!category) return null;

      return {
        id: category.id,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        bgColor: category.bgColor,
        textColor: category.textColor,
        isActive: category.isActive,
        _count: {
          initiatives: category._count.initiatives,
        },
      };
    } catch (error) {
      console.error("Error fetching category:", error);
      throw new Error("Failed to fetch category");
    }
  }

  // Create a new category
  static async create(
    data: Prisma.InitiativeCategoryCreateInput,
  ): Promise<InitiativeCategory> {
    try {
      const category = await prisma.initiativeCategory.create({
        data,
      });
      return category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  }

  // Update category
  static async update(
    id: string,
    data: Prisma.InitiativeCategoryUpdateInput,
  ): Promise<InitiativeCategory> {
    try {
      const category = await prisma.initiativeCategory.update({
        where: { id },
        data,
      });
      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Failed to update category");
    }
  }

  // Delete category
  static async delete(id: string): Promise<void> {
    try {
      await prisma.initiativeCategory.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error("Failed to delete category");
    }
  }

  // Get categories with initiative counts
  static async getWithCounts(): Promise<CategoryCard[]> {
    return this.getAll(); // Already includes counts
  }
}
