"use client";

import { FC } from "react";
import { useTranslation } from "next-i18next";

const AdventureSection: FC = () => {
  const { t } = useTranslation("common"); // 'common' matches JSON file

  return (
    <section className="bg-dynamic overflow-visible my-0 py-12 sm:py-16 md:py-20 lg:py-24 mt-12 sm:mt-16 md:mt-20">
      <div className="text-white items-center text-center flex flex-col px-4 sm:px-6">
        <h2 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
          {t("adventureTitle")}
        </h2>
        <p className="mx-auto mt-4 sm:mt-6 max-w-7xl text-sm sm:text-base md:text-lg lg:text-xl leading-6 sm:leading-7 md:leading-8 text-discription-color">
          {t("adventureDescription")}
        </p>
        {/* <Link href="#" passHref>
          <Button className="bg-accent text-white hover:bg-hover transition-all font-semibold mt-5 cursor-pointer">
            {t('getDocuments')}
          </Button>
        </Link> */}
      </div>
    </section>
  );
};

export default AdventureSection;
